// SCHEDORA – main.js
// Plain, readable JS only. No frameworks.

// ── Auto-dismiss flash alerts after 4 seconds ──────────────────
document.addEventListener('DOMContentLoaded', function () {
    var alerts = document.querySelectorAll('.alert');
    alerts.forEach(function (alert) {
        setTimeout(function () {
            var bsAlert = bootstrap.Alert.getOrCreateInstance(alert);
            bsAlert.close();
        }, 4000);
    });
});

// ── Image upload preview (multiple files) ─────────────────────
function initPhotoPreview(inputId, containerId) {
    var input     = document.getElementById(inputId);
    var container = document.getElementById(containerId);
    if (!input || !container) return;

    input.addEventListener('change', function () {
        container.innerHTML = '';
        var files = Array.from(this.files);

        files.forEach(function (file) {
            if (!file.type.startsWith('image/')) return;
            var reader = new FileReader();
            reader.onload = function (e) {
                var item = document.createElement('div');
                item.className = 'photo-preview-item';
                item.innerHTML = '<img src="' + e.target.result + '" alt="Preview">';
                container.appendChild(item);
            };
            reader.readAsDataURL(file);
        });
    });
}

// Initialise on any page that has the upload inputs
initPhotoPreview('photos', 'photoPreview');
initPhotoPreview('cover_image', 'coverPreview');

// ── Single cover image preview ────────────────────────────────
var coverInput   = document.getElementById('cover_image');
var coverPreview = document.getElementById('coverPreviewImg');
if (coverInput && coverPreview) {
    coverInput.addEventListener('change', function () {
        var file = this.files[0];
        if (!file) return;
        var reader = new FileReader();
        reader.onload = function (e) {
            coverPreview.src = e.target.result;
            coverPreview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    });
}

// ── Delete photo via AJAX ─────────────────────────────────────
function deletePhoto(photoId, btn) {
    if (!confirm('Remove this photo?')) return;

    fetch('/owner/services/photos/' + photoId + '/delete', { method: 'POST' })
        .then(function (r) { return r.json(); })
        .then(function (data) {
            if (data.success) {
                var item = btn.closest('.photo-thumb-item');
                if (item) item.remove();
            } else {
                alert('Could not remove photo.');
            }
        })
        .catch(function () { alert('Request failed.'); });
}

// ── Confirm delete before form submit ─────────────────────────
document.querySelectorAll('[data-confirm]').forEach(function (el) {
    el.addEventListener('click', function (e) {
        if (!confirm(this.dataset.confirm)) e.preventDefault();
    });
});

// ── Booking: set minimum date to today ───────────────────────
var dateInput = document.getElementById('booking_date');
if (dateInput) {
    var today = new Date().toISOString().split('T')[0];
    dateInput.setAttribute('min', today);
}
