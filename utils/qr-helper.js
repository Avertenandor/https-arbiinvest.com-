// ========================================
// ArbiInvest - QR Code Generator Helper
// ========================================

// Для production рекомендуется использовать библиотеку qrcode.js
// Установка через CDN в index.html:
// <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>

// Пример использования с библиотекой QRCode.js:
function generateRealQRCode(elementId, address) {
    // Очищаем контейнер
    const container = document.getElementById(elementId);
    container.innerHTML = '';
    
    // Создаем QR-код с библиотекой
    const qrcode = new QRCode(container, {
        text: address,
        width: 200,
        height: 200,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
    });
}

// Для более продвинутого QR-кода с логотипом в центре:
function generateQRCodeWithLogo(elementId, address, logoUrl) {
    const container = document.getElementById(elementId);
    container.innerHTML = '';
    
    // Создаем canvas
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 200;
    container.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    
    // Генерируем QR-код
    const qr = new QRCode(document.createElement('div'), {
        text: address,
        width: 200,
        height: 200,
        correctLevel: QRCode.CorrectLevel.H
    });
    
    // Добавляем логотип в центр (после генерации QR)
    setTimeout(() => {
        const img = new Image();
        img.onload = function() {
            // Рисуем QR-код
            const qrCanvas = qr._el.querySelector('canvas');
            ctx.drawImage(qrCanvas, 0, 0);
            
            // Добавляем белый фон для логотипа
            const logoSize = 40;
            const logoX = (canvas.width - logoSize) / 2;
            const logoY = (canvas.height - logoSize) / 2;
            
            ctx.fillStyle = 'white';
            ctx.fillRect(logoX - 5, logoY - 5, logoSize + 10, logoSize + 10);
            
            // Рисуем логотип
            ctx.drawImage(img, logoX, logoY, logoSize, logoSize);
        };
        img.src = logoUrl;
    }, 100);
}

// Генерация QR-кода для BSC с метаданными:
function generateBSCPaymentQR(elementId, config) {
    const {
        address,      // Адрес получателя
        amount,       // Сумма в токенах
        tokenAddress, // Адрес контракта токена
        chainId = 56, // BSC Mainnet
        message = ''  // Сообщение
    } = config;
    
    // Формируем данные для QR-кода в формате EIP-681
    // ethereum:address@chainId?value=amount&token=tokenAddress
    let qrData = `ethereum:${address}@${chainId}`;
    
    const params = [];
    if (amount) params.push(`value=${amount}`);
    if (tokenAddress) params.push(`token=${tokenAddress}`);
    if (message) params.push(`message=${encodeURIComponent(message)}`);
    
    if (params.length > 0) {
        qrData += '?' + params.join('&');
    }
    
    // Генерируем QR-код
    new QRCode(document.getElementById(elementId), {
        text: qrData,
        width: 250,
        height: 250,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.M
    });
}

// Пример использования для PLEX токена:
/*
generateBSCPaymentQR('qr-container', {
    address: '0x28915a33562b58500cf8b5b682C89A3396B8Af76',
    amount: '1000000000000000000', // 1 PLEX в wei
    tokenAddress: '0xdf179b6cadbc61ffd86a3d2e55f6d6e083ade6c1',
    chainId: 56,
    message: 'ArbiInvest Authorization'
});
*/

// Альтернативный вариант через API (для серверной генерации):
async function generateQRCodeViaAPI(address) {
    // Можно использовать Google Charts API
    const apiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(address)}`;
    
    // Или QR Code Generator API
    // const apiUrl = `https://chart.googleapis.com/chart?chs=200x200&cht=qr&chl=${encodeURIComponent(address)}`;
    
    return apiUrl;
}

// Функция для скачивания QR-кода
function downloadQRCode(canvasId, filename = 'qr-code.png') {
    const canvas = document.getElementById(canvasId);
    const link = document.createElement('a');
    link.download = filename;
    link.href = canvas.toDataURL();
    link.click();
}

// Функция для копирования QR-кода в буфер обмена (современные браузеры)
async function copyQRCodeToClipboard(canvasId) {
    const canvas = document.getElementById(canvasId);
    
    try {
        const blob = await new Promise(resolve => canvas.toBlob(resolve));
        const item = new ClipboardItem({ 'image/png': blob });
        await navigator.clipboard.write([item]);
        console.log('QR-код скопирован в буфер обмена');
        return true;
    } catch (err) {
        console.error('Ошибка копирования QR-кода:', err);
        return false;
    }
}

// Экспорт для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        generateRealQRCode,
        generateQRCodeWithLogo,
        generateBSCPaymentQR,
        generateQRCodeViaAPI,
        downloadQRCode,
        copyQRCodeToClipboard
    };
}
