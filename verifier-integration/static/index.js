const baseUrl = `${window.location.origin}${window.location.pathname}`;
let sessionId = 1; // Ideally dynamic

window.onload = () => {
  const qrCodeEl = document.getElementById('qrcode');
  const linkButton = document.getElementById('universal-link-button');
  const statusMessage = document.getElementById('status-message');
  const dashboardButton = document.getElementById('dashboard-button');

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
      startPolling(sessionId, statusMessage, dashboardButton);
    })
    .catch(error => console.error('Error fetching data from API:', error));
};

function generateQrCode(element, data) {
  new QRCode(element, {
    text: JSON.stringify(data),
    width: 256,
    height: 256,
    correctLevel: QRCode.CorrectLevel.Q
  });
}

function startPolling(sessionId, statusMessage, dashboardButton) {
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
        }
      })
      .catch(() => {
        // Still pending, no update
      });
  }, 3000);
}
