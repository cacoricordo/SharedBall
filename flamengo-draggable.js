const socket = io('https://mesatatica.onrender.com');

// Store state for all Flamengo circles
const circles = {};
const dragState = {};

// Use unique IDs: flamengo-circle1 ... flamengo-circle24
for (let i = 1; i <= 24; i++) {
    const el = document.getElementById('flamengo-circle' + i);
    circles[i] = el;
    dragState[i] = {
        dragging: false,
        offsetX: 0,
        offsetY: 0,
        lastReceived: 0
    };

    // Mouse events
    el.addEventListener('mousedown', (e) => {
        dragState[i].dragging = true;
        dragState[i].offsetX = e.offsetX;
        dragState[i].offsetY = e.offsetY;
        dragState[i].active = true;
        dragState[i].touch = false;
        window.activeFlamengoCircleId = i;
    });

    // Touch events
    el.addEventListener('touchstart', (e) => {
        dragState[i].dragging = true;
        const touch = e.touches[0];
        const rect = el.getBoundingClientRect();
        dragState[i].offsetX = touch.clientX - rect.left;
        dragState[i].offsetY = touch.clientY - rect.top;
        dragState[i].active = true;
        dragState[i].touch = true;
        window.activeFlamengoCircleId = i;
        e.preventDefault();
    }, { passive: false });
}

// Mouse move
document.addEventListener('mousemove', (e) => {
    for (let i = 1; i <= 24; i++) {
        if (dragState[i].dragging && !dragState[i].touch && window.activeFlamengoCircleId === i) {
            let x = e.clientX - dragState[i].offsetX;
            let y = e.clientY - dragState[i].offsetY;
            let ts = Date.now();
            circles[i].style.left = x + 'px';
            circles[i].style.top = y + 'px';
            socket.emit('move_circle', { x, y, ts, id: 'flamengo-' + i });
        }
    }
});

// Mouse up
document.addEventListener('mouseup', () => {
    for (let i = 1; i <= 24; i++) {
        dragState[i].dragging = false;
        dragState[i].active = false;
    }
    window.activeFlamengoCircleId = undefined;
});

// Touch move
document.addEventListener('touchmove', (e) => {
    for (let i = 1; i <= 24; i++) {
        if (dragState[i].dragging && dragState[i].touch && window.activeFlamengoCircleId === i) {
            const touch = e.touches[0];
            let x = touch.clientX - dragState[i].offsetX;
            let y = touch.clientY - dragState[i].offsetY;
            let ts = Date.now();
            circles[i].style.left = x + 'px';
            circles[i].style.top = y + 'px';
            socket.emit('move_circle', { x, y, ts, id: 'flamengo-' + i });
            e.preventDefault();
        }
    }
}, { passive: false });

// Touch end
document.addEventListener('touchend', () => {
    for (let i = 1; i <= 24; i++) {
        dragState[i].dragging = false;
        dragState[i].active = false;
    }
    window.activeFlamengoCircleId = undefined;
});

// Listen for updates for all Flamengo circles
socket.on('update_circle', (data) => {
    if (!String(data.id).startsWith('flamengo-')) return;
    const i = parseInt(String(data.id).replace('flamengo-',''), 10);
    if (circles[i] && typeof data.ts === 'number' && data.ts >= dragState[i].lastReceived) {
        dragState[i].lastReceived = data.ts;
        circles[i].style.left = data.x + 'px';
        circles[i].style.top = data.y + 'px';
    }
});