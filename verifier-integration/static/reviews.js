document.addEventListener('DOMContentLoaded', loadAllReviews);

function loadAllReviews() {
    const allReviewsContainer = document.getElementById('all-reviews-container');
    allReviewsContainer.innerHTML = ''; // Clear existing content

    const reviews = JSON.parse(localStorage.getItem('reviews')) || [];

    if (reviews.length === 0) {
        allReviewsContainer.innerHTML = '<p class="text-gray-500 text-center col-span-full py-8">No reviews yet. Be the first to add one from the main page!</p>';
        return;
    }

    // Sort reviews by date in descending order (most recent first)
    reviews.sort((a, b) => new Date(b.date) - new Date(a.date));

    reviews.forEach(review => {
        const reviewCard = document.createElement('div');
        // Reusing existing review card styling
        reviewCard.className = 'bg-gray-50 p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 ease-in-out transform hover:-translate-y-1 flex flex-col justify-between';

        // Function to generate star icons based on rating (replicated here for self-containment)
        function generateStars(rating) {
            let starsHtml = '';
            for (let i = 1; i <= 5; i++) {
                if (i <= rating) {
                    starsHtml += '<span class="text-yellow-400">&#9733;</span>'; // Filled star
                } else {
                    starsHtml += '<span class="text-gray-300">&#9734;</span>'; // Empty star
                }
            }
            return starsHtml;
        }

        reviewCard.innerHTML = `
            <div>
                <h2 class="text-xl font-bold text-gray-900 mb-2 truncate">${review.title}</h2>
                <div class="flex items-center mb-3">
                    <span class="text-lg font-bold mr-2">${review.rating}</span>
                    <div class="flex">${generateStars(review.rating)}</div>
                </div>
                <p class="text-gray-600 text-sm mb-3 line-clamp-3">${review.comment}</p>
            </div>
            <div class="mt-4 pt-4 border-t border-gray-200 text-sm text-gray-500">
                <p class="mb-1">Reviewed by: <span class="font-medium text-gray-700">${review.reviewerName}</span></p>
                <p>On: <span class="font-medium text-gray-700">${new Date(review.date).toLocaleDateString()}</span></p>
            </div>
        `;
        allReviewsContainer.appendChild(reviewCard);
    });
}