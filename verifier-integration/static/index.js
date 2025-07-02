const baseUrl = `${window.location.origin}${window.location.pathname.replace('index.html', '')}`; // Adjusted to handle base URL correctly
let sessionId = 1; // Ideally dynamic, but using 1 for demo purposes

window.onload = () => {
  const qrCodeEl = document.getElementById('qrcode');
  const linkButton = document.getElementById('universal-link-button');
  const statusMessage = document.getElementById('status-message');
  const dashboardButton = document.getElementById('dashboard-button');
  const reviewFormContainer = document.getElementById('review-form-container');
  const submitReviewButton = document.getElementById('submit-review-button');
  const reviewForm = document.getElementById('review-form');
  const reviewRatingInput = document.getElementById('review-rating');
  const starRatingContainer = document.getElementById('review-star-rating');

  // Initialize star rating functionality
  if (starRatingContainer) {
    let currentRating = 0; // To store the selected rating

    starRatingContainer.addEventListener('mouseover', (event) => {
      if (event.target.tagName === 'SPAN') {
        const value = parseInt(event.target.dataset.value);
        highlightStars(value);
      }
    });

    starRatingContainer.addEventListener('mouseout', () => {
      highlightStars(currentRating); // Revert to selected rating on mouse out
    });

    starRatingContainer.addEventListener('click', (event) => {
      if (event.target.tagName === 'SPAN') {
        currentRating = parseInt(event.target.dataset.value);
        reviewRatingInput.value = currentRating; // Update the hidden input
        highlightStars(currentRating); // Apply permanent highlighting
      }
    });

    function highlightStars(rating) {
      const stars = starRatingContainer.querySelectorAll('span');
      stars.forEach(star => {
        if (parseInt(star.dataset.value) <= rating) {
          star.classList.add('selected');
        } else {
          star.classList.remove('selected');
        }
      });
    }
  }


  // Fetch initial sign-in data
  fetch(`${baseUrl}api/sign-in`)
    .then(response => {
      if (response.ok) return response.json();
      throw new Error('Failed to fetch API data');
    })
    .then(data => {
      // Show QR Code
      generateQrCode(qrCodeEl, data);
      qrCodeEl.style.display = 'block';

      // Encode request and set universal link
      const encodedRequest = btoa(JSON.stringify(data));
      linkButton.href = `https://wallet.privado.id/#i_m=${encodedRequest}`;
      linkButton.style.display = 'inline-block';

      // Poll for verification
      startPolling(sessionId, statusMessage, dashboardButton, reviewFormContainer, submitReviewButton);
    })
    .catch(error => console.error('Error fetching data from API:', error));

  // Add event listener for review form submission
  reviewForm.addEventListener('submit', handleReviewSubmission);
};

function generateQrCode(element, data) {
  new QRCode(element, {
    text: JSON.stringify(data),
    width: 256,
    height: 256,
    correctLevel: QRCode.CorrectLevel.Q
  });
}

function startPolling(sessionId, statusMessage, dashboardButton, reviewFormContainer, submitReviewButton) {
  const interval = setInterval(() => {
    fetch(`${baseUrl}api/check-verification?sessionId=${sessionId}`)
      .then(res => {
        if (res.status === 200) return res.json();
        throw new Error("Not yet verified");
      })
      .then(result => {
        if (result.verified) {
          clearInterval(interval);
          document.body.classList.add('verified');
          statusMessage.textContent = '✅ Credential Verified!';
          statusMessage.style.display = 'block';

          // Enable and style the dashboard button
          dashboardButton.disabled = false;
          dashboardButton.classList.remove('disabled-button');
          dashboardButton.classList.add('enabled-button');

          // Enable the review form and its submit button
          reviewFormContainer.classList.remove('disabled-form');
          submitReviewButton.disabled = false;
          submitReviewButton.classList.remove('disabled-button');
          submitReviewButton.classList.add('enabled-button');
        }
      })
      .catch(() => {
        // Still pending, no update
      });
  }, 3000);
}

function handleReviewSubmission(event) {
  event.preventDefault(); // Prevent default form submission

  const title = document.getElementById('review-title').value;
  const rating = parseInt(document.getElementById('review-rating').value); // Get rating from hidden input
  const comment = document.getElementById('review-comment').value;
  const reviewerName = document.getElementById('reviewer-name').value;

  // Basic validation for rating
  if (rating === 0) {
      alert("Please select a star rating.");
      return;
  }

  const newReview = {
    id: Date.now(), // Simple unique ID
    title,
    rating,
    comment,
    reviewerName,
    date: new Date().toISOString()
  };

  const reviews = JSON.parse(localStorage.getItem('reviews')) || [];
  reviews.push(newReview);
  localStorage.setItem('reviews', JSON.stringify(reviews));

  // Clear the form
  document.getElementById('review-form').reset();
  // Reset star rating visual
  const starRatingContainer = document.getElementById('review-star-rating');
  if (starRatingContainer) {
    starRatingContainer.querySelectorAll('span').forEach(star => star.classList.remove('selected'));
    document.getElementById('review-rating').value = 0; // Reset hidden input
  }


  alert('Review submitted successfully!');
}