/* Premium Main JS */
document.addEventListener('DOMContentLoaded', function() {

    // Mobile Navigation
    var navToggle = document.querySelector('.nav-toggle');
    var navMenu = document.querySelector('.nav-menu');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
            var expanded = navToggle.getAttribute('aria-expanded') === 'true';
            navToggle.setAttribute('aria-expanded', String(!expanded));
        });

        var navLinks = navMenu.querySelectorAll('a');
        navLinks.forEach(function(link) {
            link.addEventListener('click', function() {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
                navToggle.setAttribute('aria-expanded', 'false');
            });
        });

        document.addEventListener('click', function(e) {
            if (!navMenu.contains(e.target) && !navToggle.contains(e.target)) {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
                navToggle.setAttribute('aria-expanded', 'false');
            }
        });
    }

    // Header scroll effect
    var header = document.querySelector('.site-header');
    if (header) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 10) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }

    // Active nav link
    var currentPage = window.location.pathname.split('/').pop() || 'index.html';
    var allNavLinks = document.querySelectorAll('.nav-link');
    allNavLinks.forEach(function(link) {
        link.classList.remove('active');
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active');
        }
    });

    // Intersection Observer for scroll animations
    var animateElements = document.querySelectorAll('.animate-in');
    if (animateElements.length > 0 && 'IntersectionObserver' in window) {
        var observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

        animateElements.forEach(function(el) {
            observer.observe(el);
        });
    }

    // Counter animation for stat numbers
    var statNumbers = document.querySelectorAll('.stat-number[data-count]');
    if (statNumbers.length > 0 && 'IntersectionObserver' in window) {
        var counterObserver = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    var el = entry.target;
                    var target = parseInt(el.getAttribute('data-count'), 10);
                    var suffix = el.textContent.replace(/[0-9]/g, '');
                    var duration = 2000;
                    var start = 0;
                    var startTime = null;

                    function animate(timestamp) {
                        if (!startTime) startTime = timestamp;
                        var progress = Math.min((timestamp - startTime) / duration, 1);
                        var eased = 1 - Math.pow(1 - progress, 3);
                        var current = Math.floor(eased * target);
                        el.textContent = current + suffix;
                        if (progress < 1) {
                            requestAnimationFrame(animate);
                        }
                    }
                    requestAnimationFrame(animate);
                    counterObserver.unobserve(el);
                }
            });
        }, { threshold: 0.5 });

        statNumbers.forEach(function(el) {
            counterObserver.observe(el);
        });
    }

    // Form validation with inline errors
    var rfqForm = document.getElementById('rfqForm');
    if (rfqForm) {
        rfqForm.addEventListener('submit', function(e) {
            var nameInput = document.getElementById('name');
            var emailInput = document.getElementById('email');
            var messageInput = document.getElementById('message');
            var nameError = document.getElementById('name-error');
            var emailError = document.getElementById('email-error');
            var messageError = document.getElementById('message-error');
            var hasError = false;

            // Clear previous errors
            [nameInput, emailInput, messageInput].forEach(function(input) {
                if (input) input.classList.remove('error');
            });
            [nameError, emailError, messageError].forEach(function(err) {
                if (err) err.textContent = '';
            });

            if (nameInput && !nameInput.value.trim()) {
                nameInput.classList.add('error');
                if (nameError) nameError.textContent = 'Please enter your full name.';
                hasError = true;
            }

            if (emailInput) {
                if (!emailInput.value.trim()) {
                    emailInput.classList.add('error');
                    if (emailError) emailError.textContent = 'Please enter your email address.';
                    hasError = true;
                } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value.trim())) {
                    emailInput.classList.add('error');
                    if (emailError) emailError.textContent = 'Please enter a valid email address.';
                    hasError = true;
                }
            }

            if (messageInput && !messageInput.value.trim()) {
                messageInput.classList.add('error');
                if (messageError) messageError.textContent = 'Please enter a message.';
                hasError = true;
            }

            if (hasError) {
                e.preventDefault();
                var firstError = rfqForm.querySelector('.error');
                if (firstError) firstError.focus();
            }
        });
    }

});

/* ========================================
   RSS NEWS FEED
   ======================================== */

var METAL_RSS_FEEDS = [
  { url: 'https://3dprint.com/feed/', title: '3D Printing Industry News' },
  { url: 'https://3dprintingindustry.com/feed/', title: '3D Printing Industry' },
  { url: 'https://3dnatives.com/en/feed/', title: '3D Natives' },
  { url: 'https://newatlas.com/index.rss', title: 'New Atlas' }
];

function stripHtmlTags(html) {
  var tmp = document.createElement('DIV');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
}

function fetchMetalRSSFeed(feedUrl) {
  return new Promise(function(resolve) {
    var controller = new AbortController();
    var timeoutId = setTimeout(function() { controller.abort(); resolve([]); }, 6000);
    var corsUrl = 'https://api.rss2json.com/v1/api.json?rss_url=' + encodeURIComponent(feedUrl);
    fetch(corsUrl, { signal: controller.signal })
      .then(function(r) { return r.json(); })
      .then(function(data) {
        clearTimeout(timeoutId);
        if (data.items) {
          resolve(data.items.slice(0, 2).map(function(item) {
            return {
              title: item.title,
              link: item.link,
              pubDate: new Date(item.pubDate).toLocaleDateString(),
              description: item.description ? stripHtmlTags(item.description).substring(0, 150) + '...' : '',
              thumbnail: item.thumbnail || (item.enclosure && item.enclosure.link) || null
            };
          }));
        } else { resolve([]); }
      })
      .catch(function() { clearTimeout(timeoutId); resolve([]); });
  });
}

var METAL_NEWS_FALLBACKS = [
  'images/03-laser-sintering-sparks.png',
  'images/10-dmls-machine-interior.png',
  'images/16-slm-recoater-blade.png',
  'images/14-ded-machine-sparks.png',
  'images/12-build-plate-removal.png',
  'images/18-powder-handling.png'
];

function loadMetalNewsFeed() {
  var container = document.getElementById('news-feed');
  if (!container) return;
  container.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:#888;padding:2rem;">Loading latest industry news...</p>';

  var promises = METAL_RSS_FEEDS.map(function(feed) {
    return fetchMetalRSSFeed(feed.url);
  });

  Promise.all(promises).then(function(results) {
    var allArticles = [];
    results.forEach(function(articles) { allArticles = allArticles.concat(articles); });
    var filtered = allArticles.filter(function(a) { return a.title && a.link; }).slice(0, 6);

    if (filtered.length === 0) {
      container.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:#888;">Unable to load news at this time.</p>';
      return;
    }

    container.innerHTML = filtered.map(function(article, idx) {
      var fallbackImg = METAL_NEWS_FALLBACKS[idx % METAL_NEWS_FALLBACKS.length];
      var imgSrc = article.thumbnail || fallbackImg;
      return [
        '<div class="news-item">',
        '<div class="news-image">',
        '<img src="' + imgSrc + '" data-fallback="' + fallbackImg + '" alt="Industry News" loading="lazy"',
        ' onerror="this.onerror=null;this.src=this.dataset.fallback">',
        '</div>',
        '<div class="news-content">',
        '<div class="news-date">' + article.pubDate + '</div>',
        '<h4>' + article.title + '</h4>',
        '<p>' + article.description + '</p>',
        '<a href="' + article.link + '" target="_blank" rel="noopener noreferrer" class="news-link">Read More \u2192</a>',
        '</div>',
        '</div>'
      ].join('');
    }).join('');
  });
}

document.addEventListener('DOMContentLoaded', loadMetalNewsFeed);


/* ========================================
   WEB3FORMS CONTACT FORM
   ======================================== */

document.addEventListener('DOMContentLoaded', function() {
  var contactForms = document.querySelectorAll('#rfqForm, #contact-form');
  contactForms.forEach(function(form) {
    // Ensure there's a message element
    var msgEl = form.querySelector('.form-message');
    if (!msgEl) {
      msgEl = document.createElement('div');
      msgEl.className = 'form-message';
      form.insertBefore(msgEl, form.firstChild);
    }

    form.addEventListener('submit', function(e) {
      e.preventDefault();
      msgEl.textContent = '';
      msgEl.className = 'form-message';

      // Basic validation
      var nameEl = form.querySelector('[name="name"]');
      var emailEl = form.querySelector('[name="email"]');
      var messageEl = form.querySelector('[name="message"]');
      var errors = [];
      if (nameEl && !nameEl.value.trim()) errors.push('Please enter your name.');
      if (emailEl) {
        if (!emailEl.value.trim()) {
          errors.push('Please enter your email.');
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailEl.value.trim())) {
          errors.push('Please enter a valid email address.');
        }
      }
      if (messageEl && !messageEl.value.trim()) errors.push('Please enter a message.');

      if (errors.length > 0) {
        msgEl.className = 'form-message error';
        msgEl.innerHTML = errors.join('<br>');
        return;
      }

      var submitBtn = form.querySelector('[type="submit"]');
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Sending...'; }

      var formData = new FormData(form);
      if (!formData.get('access_key')) {
        formData.append('access_key', '6f33053b-6d08-414b-9615-665f88c98da8');
      }

      fetch('https://api.web3forms.com/submit', { method: 'POST', body: formData })
        .then(function(r) { return r.json(); })
        .then(function(data) {
          if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Send Message'; }
          if (data.success) {
            msgEl.className = 'form-message success';
            msgEl.textContent = 'Thank you! Your message has been sent. We will respond within 24 hours.';
            form.reset();
          } else {
            msgEl.className = 'form-message error';
            msgEl.textContent = 'Error sending message: ' + (data.message || 'Please try again.');
          }
        })
        .catch(function() {
          if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Send Message'; }
          msgEl.className = 'form-message error';
          msgEl.textContent = 'Network error. Please check your connection and try again.';
        });
    });
  });
});
