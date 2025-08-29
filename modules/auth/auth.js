// ========================================
// ArbiInvest - Модуль авторизации
// ========================================

class AuthModule {
    constructor() {
        // Конфигурация
        this.config = {
            bscScanApiKey: 'RAI3FTD9W53JPYZ2AHW8IBH9BXUC71NRH1',
            bscScanApiUrl: 'https://api.bscscan.com/api',
            systemWallet: '0x28915a33562b58500cf8b5b682C89A3396B8Af76',
            plexToken: '0xdf179b6cadbc61ffd86a3d2e55f6d6e083ade6c1',
            requiredAmount: '1000000000000000000', // 1 PLEX в wei
            checkInterval: 10000, // 10 секунд между проверками
            maxCheckTime: 300000, // 5 минут максимум
            typingSpeed: 35 // Скорость анимации печатания
        };
        
        // Список разрешенных кошельков
        this.allowedWallets = [
            '0xb80fB15b754F08849d93Ebe591eD20dd1fe8297d',
            '0x45cd10D729010eB5c06F12a8060900EFCd7Ecf61',
            '0xB7dFfA7EEc8892947Bf7c4f6B38a12fAe8cB1ECF',
            '0x0376fe68647Ca26C2e62F47D5F1cc502dD1FD172',
            '0x25717953291f11cAaE385BAd31b01eD5160f16E5',
            '0x9206C33222E42cd19Fa52eF33398ef355B1B74E7',
            '0x39Be5358e423863f0C0E14D0aD828a4764Dc331B',
            '0x5Cdd115a940203A2CA256a0b94dcC815aBE19ab9',
            '0x9EDEecdE0CAa92354cC4B12653DCA74a74CA73d4',
            '0x3a5dd5BC06bF0069338c77286c4948b599Eb8FE5',
            '0xDE302Db1603F1554560C66FD0421b469e8027401',
            '0xe1f5ad358b3428ff920a9c1e0efe62028954e367',
            '0x6d8B141557bA2EA03778a01d88bA71421F5Ff350',
            '0x77475AD5EA2127B288D0734C75C1A303Bc005634',
            '0x37d8D0EbBe86e2FFBc261Eb543465A3d318c0737',
            '0xdA7Cc02a7Db2a50128854D736fc2cD2982dCaE42',
            '0xb5bdEDaC5a9EF8d050d8d837973E3bC24aC3B9C1',
            '0xF904E56651D251a93561df39B77410815A3013Bd',
            '0xC20B3C16Ee4ba0c587Aa640c83Fa17fA5012fc08',
            '0x2878FdB146bED98A09f19b90A95F988B625616a5',
            '0x7b2A78FB8CED00390c0206Ad2429D59610f52222',
            '0x4145b428280B5e194523b4EdDf03cfC4F9e594dA',
            '0x50B85711808b5954FFa2742b975403222d3e1B8f',
            '0x45A9035FF32ecAb14148290cdeADBC5F95AE310A',
            '0xFF216fB13780FBD0177E922727a0BC3f5d5D5E1C',
            '0xfaf4B2a58722e999E81cB8361a0c24709C41581C',
            '0xEaa275C4E448B2807455bbB49c1Eb9EA7D689AEC',
            '0x3f4E1622e741cb2b951Bae57565630F90BD6a1bA',
            '0xDeaf53C6633d02f8c8Cc153a449AEa7252Fd746D',
            '0x7CE34941d152b44079a3D7CF969B99A381167632',
            '0x20450fcB4575BDE87Ee8e2543A94b817eb3a2cC2',
            '0xA56eABC0227C6A9F68e3b56dEE53d139d09E02e9',
            '0xe1cBD7E33Ec8b858Be82686B965B8Cee910d1953',
            '0x3ff1E76B3CCD7546EadFb6D214f2B3bE76ecC64e',
            '0x0b9E897d69ab62F35300467Dc252BEe3eFc50703',
            '0x60Cdb1480694742279570A1d44EB41AC89F73C97',
            '0xeb7fAC6CE9CA7DFC6bEcACcd3c25Bbc404B17433',
            '0x7a04b9273D8324e5079A72F7557D5535cbf1bdE7',
            '0xf606efE583e1D2A20c08e890070192082F7e9062',
            '0x8F7FAc746bedBeAa77AE0a9e78A5EecC38463bf1',
            '0x2a7fDBf07A38fcf1C9b11E579a65C24b16068b0e',
            '0x45e9EccF7C6D0D66bE343795A783B77d5322A3Aa',
            '0xF559648Ae64C0f91656B6C0432e716b063Df590c',
            '0x1A9c346754390d0C8D48e538d30156792829716E',
            '0x8EE718A5e1F9468A45b3086F339F54A60CF501b6',
            '0x82688d5687735FFa2D2D3a6170e7A1E1B2e0C7bb',
            '0xaf645FEA8f9cB3f8861C25c2df3F1426928B89cc',
            '0xC462Ac563c71a5B6a9AAC4f02F9008eAb0C6a781',
            '0x8eA7bf7Bfbc800cF361efa0b2F923c25Dd21C578',
            '0x2C1f1908dB90BbeCf308305a07F333218d0e8A46',
            '0x8fDc65c61AAfc82AbBBC379Fc6772d4B00E3D25d',
            '0xC98F67426830c05cE49b73Ef2E9Ed5eD97102227',
            '0x995749A8Bc351e7FA7accfCC91BFc79f4019D117',
            '0xb0B50a7C0167c23B5779E12f32eeE49dF93eFC0C',
            '0xccd8bd1563acfe00bd0215e465850ad93b7893d1',
            '0x6993E371E7a03E184584c396dc4Dc6D6a47A86b4',
            '0x682A0f1195a9a7035824aa3042A1253C52C0c952',
            '0xa270A3894f45981a856dBab94b77dE624B052c76',
            '0x08e86214a3241377C84F54E4DcA946eea5b45662',
            '0x3A349A113db3cEe765c16B71623a4b33B072d333',
            '0xaFC6730de1F081d3ee7787218f513b84De81C2a9',
            '0x699dd0d8164eDd0Da0B70c9464Cc0912c0444699',
            '0xdE158774Db868657edC4C54f4CA298B36521D506',
            '0xAC91C31CA14D787a1E02Bc5fc8EF693780e6b6f2',
            '0x689Cfbfcc36E46dF039a26fA81f5D4d1ef88c005',
            '0x2858540380bCE86A4998c9a053153665C0c3041C',
            '0x1a1b4091e2f401b7ae0968c184b10e00e454e7a9',
            '0xD8B2a9Ce77572615AbBb8CC672AD9445b26Fc311',
            '0x33Cb75e910B962DF0cce43d35896475bdA52Ff25',
            '0x613DB20E6A61947FED05E8E6f81961Db40d41E58',
            '0x67eC2731495c4BF3785ecb510a94503FBF36ECe9',
            '0x02134387e5F03687354b448F14F9E618709b94A4',
            '0x3Be0714242D89c23aDbAB9FB4F3dD96324318128',
            '0xA0a72D66A7150386F23126e5B70Fe08fE9b31902',
            '0x753cdC82efF4ec51F4891C91c50625D0d5073E80',
            '0x9EfBbDFBafDD8c7cdD24BEC3Aae9aEB648D4f53C',
            '0x10647c42E4507146657b32bDfD9E07f12205Ae6b',
            '0x7D8556f68d5e04C98DA61E52F7301354Af964784',
            '0x2Ff7135b97479B116696Db55EFC1050F0c071fcb',
            '0xc68bB6F8c619f3Ef924298aF65bA39DD42B2a858',
            '0x8bE500090bd3C6cf0501a9986658a11045F9AA0D',
            '0xBF9e7C2F5327b4B6F14f1038B6d2843Bbb5e625b',
            '0x5f15086394100e5Fea468a84313Ac36AcAD28C5B',
            '0xC4c998F9A2f6141a7ABc09d8bdCB707BC87280A0',
            '0xee5408AEf51428402CBD47fB594Abb6Ba49Fd93e',
            '0x7a988497406D1F80BeeBBa2994a3ce5323087041',
            '0x622d21493990D8e28df032653768fC90eDAf4681',
            '0xa03DCF9b50Ef6C0E685c4354e4f26a234675C4e4',
            '0x6ECeBe622320EC69c5ff0b9e47eD56E4dAA84a70',
            '0x86A732435c35CdDB2D7B8BC0E59147541FC424f3',
            '0x47E67c4B39Addb484eE0619c4250E1F8F0C3E86a',
            '0x508aa2db0133f01d63b6e5fe9f19bcf20d577faf',
            '0x5f8c4c42e8c85360f2dbf2b3422ef0d57c9ea8aa',
            '0xfd92ce6177523a3da530c19515a94b83bd196bd3',
            '0x03e0cF74B85dD997db6c8F4042372a25D1c8d84f',
            '0x28dd6444eb76b3c5f0b9e738b0771cacd8a93008',
            '0xD631018B384476c96377C7Ed837B057B3F7f68a7',
            '0x36186aF87d418FBDC6C165d0A1baf6bA7b548153',
            '0x4290300fc342B5Ed022c1FB1146A6C9267893855',
            '0xaF5B5205202abFEb7089d840D1df82Cffd40d938',
            '0x0cd2Acbb668DcD5b0e0a06FFc3d535Cc4B2a25af',
            '0xb83c32931628a79C9226b3A96d7515Ca53624bBB',
            '0xde1aF74D8AF7446e962256829eFe4E687B8E6F34',
            '0x69AaA2e9bf1fA202bc59370268481dbdD313b712',
            '0x4532De4485D210a1e459623ffd3913e42fb18D95',
            '0x51ac5a21b2abe1ac383e95aa8843cbb772350460',
            '0x53321C157714C02E5421de15701E139d0da3234b',
            '0x8ED6b07177164fcc536C956eAd7Ba6A6342F669c',
            '0x0411ef1F5f645c3f2E93Ae85C341E6fa1b2a9819',
            '0xB243ae16371d3b0cAeB4A6B553c3c32476D26C3D',
            '0x9F718ee7B838603EB9B367BFE21aF88eb1807b84',
            '0xD8c7f9442aAd522A379DD2c3E2E630fbb04Ea7B5',
            '0x42fB4Fa18eAf541Cb5F5a23985dAEdb019efbaCE',
            '0x808e6f18f5eb670aa9def96e23e9ee07016741dc',
            '0x7920f8216a5b41e794758054c7411dddd2b13d10',
            '0x9D1a5BB503B360d7B268cB4cdbA5A6d589FE0E4c'
        ].map(w => w.toLowerCase());
        
        this.currentUserWallet = null;
        this.checkTimer = null;
        this.startCheckTime = null;
    }
    
    // Инициализация модуля
    init() {
        console.log('🔐 Initializing Auth Module...');
    }
    
    // Показать экран выбора (хомяк или рептилоид)
    async showAuthScreen() {
        const app = document.getElementById('app');
        const welcomeScreen = document.getElementById('welcome-screen');
        
        // Создаем экран авторизации
        const authScreen = document.createElement('div');
        authScreen.id = 'auth-screen';
        authScreen.className = 'auth-screen';
        authScreen.innerHTML = `
            <div class="auth-container">
                <div class="auth-header">
                    <div class="logo-container">
                        <div class="logo-icon">
                            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                                <circle cx="16" cy="16" r="15" stroke="currentColor" stroke-width="2" opacity="0.2"/>
                                <path d="M16 8L16 24M8 16L24 16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                                <circle cx="16" cy="16" r="4" fill="currentColor"/>
                            </svg>
                        </div>
                        <span class="logo-text">ArbiInvest</span>
                    </div>
                </div>
                <div class="auth-content">
                    <div class="typing-container">
                        <div id="auth-typing-text" class="typing-text"></div>
                        <span class="cursor" id="auth-cursor">|</span>
                    </div>
                    <div id="auth-buttons" class="auth-buttons" style="display: none;">
                        <button id="reptiloid-btn" class="auth-choice-btn reptiloid">
                            <span class="auth-btn-icon">🦎</span>
                            <span>Я рептилоид</span>
                        </button>
                        <button id="hamster-btn" class="auth-choice-btn hamster">
                            <span class="auth-btn-icon">🐹</span>
                            <span>Я хомяк</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // Плавный переход
        welcomeScreen.style.opacity = '0';
        setTimeout(() => {
            welcomeScreen.style.display = 'none';
            document.body.appendChild(authScreen);
            
            // Анимация печатания
            this.typeText('auth-typing-text', 'Ты хомяк или рептилоид?', async () => {
                document.getElementById('auth-cursor').style.display = 'none';
                const buttons = document.getElementById('auth-buttons');
                buttons.style.display = 'flex';
                buttons.style.animation = 'fadeIn 0.5s ease-in';
                
                // Обработчики кнопок
                document.getElementById('reptiloid-btn').addEventListener('click', () => {
                    this.handleReptiloidChoice();
                });
                
                document.getElementById('hamster-btn').addEventListener('click', () => {
                    this.handleHamsterChoice();
                });
            });
        }, 500);
    }
    
    // Обработка выбора рептилоида
    async handleReptiloidChoice() {
        const authScreen = document.getElementById('auth-screen');
        const authContent = authScreen.querySelector('.auth-content');
        
        authContent.innerHTML = `
            <div class="wallet-verification">
                <h2 class="verification-title">Верификация рептилоида</h2>
                <p class="verification-desc">Введите адрес вашего кошелька BSC</p>
                <div class="wallet-input-group">
                    <input type="text" 
                           id="wallet-address" 
                           class="wallet-input" 
                           placeholder="0x..."
                           maxlength="42">
                    <button id="verify-wallet-btn" class="verify-btn">
                        Проверить
                    </button>
                </div>
                <div id="verification-status" class="verification-status"></div>
            </div>
        `;
        
        // Обработчик проверки кошелька
        document.getElementById('verify-wallet-btn').addEventListener('click', () => {
            this.verifyWallet();
        });
        
        // Проверка по Enter
        document.getElementById('wallet-address').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.verifyWallet();
            }
        });
    }
    
    // Проверка кошелька
    async verifyWallet() {
        const walletInput = document.getElementById('wallet-address');
        const statusDiv = document.getElementById('verification-status');
        const wallet = walletInput.value.trim().toLowerCase();
        
        // Валидация адреса
        if (!wallet.match(/^0x[a-f0-9]{40}$/i)) {
            statusDiv.innerHTML = `
                <div class="status-message error">
                    <span class="status-icon">❌</span>
                    <span>Неверный формат адреса кошелька</span>
                </div>
            `;
            return;
        }
        
        // Проверка в списке разрешенных
        if (!this.allowedWallets.includes(wallet)) {
            statusDiv.innerHTML = `
                <div class="status-message error">
                    <span class="status-icon">🚫</span>
                    <span>Ваш кошелек не в списке рептилоидов</span>
                </div>
            `;
            return;
        }
        
        // Кошелек в списке, показываем инструкции
        this.currentUserWallet = wallet;
        this.showPaymentInstructions();
    }
    
    // Показать инструкции по оплате
    showPaymentInstructions() {
        const authContent = document.querySelector('.auth-content');
        
        authContent.innerHTML = `
            <div class="payment-instructions">
                <h2 class="payment-title">Подтверждение доступа</h2>
                <div class="payment-info">
                    <p class="payment-desc">
                        Для получения доступа отправьте <strong>1 PLEX</strong> токен на адрес системы:
                    </p>
                    <div class="system-wallet">
                        <code id="system-address">${this.config.systemWallet}</code>
                        <button class="copy-btn" onclick="window.authModule.copyAddress()">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <rect x="5" y="5" width="9" height="9" stroke="currentColor" stroke-width="1.5" rx="1"/>
                                <path d="M3 11V3H11" stroke="currentColor" stroke-width="1.5"/>
                            </svg>
                        </button>
                    </div>
                    <div class="token-info">
                        <p><strong>Токен PLEX:</strong></p>
                        <code class="token-address">0xdf179b6cadbc61ffd86a3d2e55f6d6e083ade6c1</code>
                    </div>
                    <div class="timer-container">
                        <div class="timer-circle">
                            <svg class="timer-svg" width="120" height="120">
                                <circle class="timer-bg" cx="60" cy="60" r="54"/>
                                <circle class="timer-progress" cx="60" cy="60" r="54"/>
                            </svg>
                            <div class="timer-text" id="timer-text">5:00</div>
                        </div>
                        <p class="timer-desc">Осталось времени</p>
                    </div>
                    <div id="transaction-status" class="transaction-status">
                        <div class="status-checking">
                            <div class="pulse-dot"></div>
                            <span>Ожидание транзакции...</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Запускаем проверку транзакций
        this.startTransactionCheck();
    }
    
    // Запуск проверки транзакций
    async startTransactionCheck() {
        this.startCheckTime = Date.now();
        let checkCount = 0;
        
        // Обновление таймера
        const updateTimer = () => {
            const elapsed = Date.now() - this.startCheckTime;
            const remaining = Math.max(0, this.config.maxCheckTime - elapsed);
            const minutes = Math.floor(remaining / 60000);
            const seconds = Math.floor((remaining % 60000) / 1000);
            
            const timerText = document.getElementById('timer-text');
            if (timerText) {
                timerText.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            }
            
            // Обновление круга прогресса
            const progress = document.querySelector('.timer-progress');
            if (progress) {
                const circumference = 2 * Math.PI * 54;
                const offset = circumference * (1 - remaining / this.config.maxCheckTime);
                progress.style.strokeDashoffset = offset;
            }
            
            if (remaining <= 0) {
                this.handleTimeout();
                return;
            }
        };
        
        // Функция проверки
        const checkTransaction = async () => {
            checkCount++;
            console.log(`🔍 Checking transaction... (attempt ${checkCount})`);
            
            try {
                // Проверяем транзакции с адреса пользователя
                const found = await this.checkPlexTransaction();
                
                if (found) {
                    this.handleSuccessfulVerification();
                    return;
                }
                
                // Продолжаем проверку
                const elapsed = Date.now() - this.startCheckTime;
                if (elapsed < this.config.maxCheckTime) {
                    // Используем разные интервалы для оптимизации запросов
                    const nextCheckDelay = checkCount < 5 ? 5000 : 10000; // Первые 5 проверок чаще
                    this.checkTimer = setTimeout(checkTransaction, nextCheckDelay);
                } else {
                    this.handleTimeout();
                }
            } catch (error) {
                console.error('Error checking transaction:', error);
                // Продолжаем проверку даже при ошибке
                const elapsed = Date.now() - this.startCheckTime;
                if (elapsed < this.config.maxCheckTime) {
                    this.checkTimer = setTimeout(checkTransaction, 15000); // Больше задержка при ошибке
                }
            }
        };
        
        // Запускаем таймер и проверку
        setInterval(updateTimer, 1000);
        updateTimer();
        
        // Первая проверка через 3 секунды
        setTimeout(checkTransaction, 3000);
    }
    
    // Проверка транзакции PLEX
    async checkPlexTransaction() {
        try {
            // Получаем последние токен-транзакции с адреса пользователя
            const url = `${this.config.bscScanApiUrl}?module=account&action=tokentx` +
                       `&address=${this.currentUserWallet}` +
                       `&contractaddress=${this.config.plexToken}` +
                       `&startblock=0&endblock=999999999` +
                       `&sort=desc&apikey=${this.config.bscScanApiKey}`;
            
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.status === '1' && data.result && data.result.length > 0) {
                // Проверяем транзакции за последние 6 минут
                const checkStartTime = (this.startCheckTime - 60000) / 1000; // -1 минута от начала
                const currentTime = Date.now() / 1000;
                
                for (const tx of data.result) {
                    const txTime = parseInt(tx.timeStamp);
                    
                    // Проверяем временной диапазон
                    if (txTime >= checkStartTime && txTime <= currentTime) {
                        // Проверяем, что транзакция на наш системный кошелек
                        if (tx.to.toLowerCase() === this.config.systemWallet.toLowerCase() &&
                            tx.from.toLowerCase() === this.currentUserWallet.toLowerCase()) {
                            
                            // Проверяем сумму (1 PLEX или больше)
                            const amount = BigInt(tx.value);
                            const required = BigInt(this.config.requiredAmount);
                            
                            if (amount >= required) {
                                console.log('✅ Valid PLEX transaction found:', tx.hash);
                                return true;
                            }
                        }
                    }
                }
            }
            
            return false;
        } catch (error) {
            console.error('Error checking PLEX transaction:', error);
            return false;
        }
    }
    
    // Успешная верификация
    handleSuccessfulVerification() {
        clearTimeout(this.checkTimer);
        
        const statusDiv = document.getElementById('transaction-status');
        if (statusDiv) {
            statusDiv.innerHTML = `
                <div class="status-success">
                    <span class="success-icon">✅</span>
                    <span>Транзакция подтверждена! Добро пожаловать, рептилоид!</span>
                </div>
            `;
        }
        
        // Сохраняем авторизацию
        localStorage.setItem('auth_wallet', this.currentUserWallet);
        localStorage.setItem('auth_time', Date.now().toString());
        localStorage.setItem('is_reptiloid', 'true');
        
        // Переход на основной сайт через 2 секунды
        setTimeout(() => {
            this.enterMainApp();
        }, 2000);
    }
    
    // Таймаут проверки
    handleTimeout() {
        clearTimeout(this.checkTimer);
        
        const statusDiv = document.getElementById('transaction-status');
        if (statusDiv) {
            statusDiv.innerHTML = `
                <div class="status-error">
                    <span class="error-icon">⏱️</span>
                    <span>Время истекло. Транзакция не найдена.</span>
                </div>
            `;
        }
        
        // Возврат к выбору через 3 секунды
        setTimeout(() => {
            location.reload();
        }, 3000);
    }
    
    // Обработка выбора хомяка
    async handleHamsterChoice() {
        const authContent = document.querySelector('.auth-content');
        
        authContent.innerHTML = `
            <div class="hamster-message">
                <div class="typing-container">
                    <div id="hamster-typing-text" class="typing-text"></div>
                    <span class="cursor" id="hamster-cursor">|</span>
                </div>
                <div id="hamster-link" class="hamster-link" style="display: none;">
                    <a href="https://t.me/+bjnFt-mjdUA2NDE8" target="_blank" class="telegram-btn">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.56c-.21 2.27-1.13 7.76-1.6 10.3-.2 1.08-.59 1.44-.97 1.47-.82.07-1.45-.54-2.24-.97-1.24-.78-1.94-1.27-3.15-2.03-1.39-.87-.49-1.35.3-2.13.21-.2 3.82-3.5 3.89-3.8.01-.04.01-.17-.06-.25s-.18-.05-.26-.03c-.11.03-1.88 1.2-5.32 3.53-.5.35-.96.52-1.37.51-.45-.01-1.32-.26-1.97-.47-.79-.26-1.42-.4-1.37-.84.03-.23.34-.47.94-.7 3.68-1.6 6.14-2.66 7.37-3.17 3.51-1.46 4.24-1.71 4.71-1.72.11 0 .34.02.49.14.13.1.16.23.18.34-.01.06.01.24 0 .38z" fill="currentColor"/>
                        </svg>
                        <span>Перейти в Telegram</span>
                    </a>
                </div>
            </div>
        `;
        
        const message = 'Прости мой друг, но Хомякам заказан путь в наш денежный ручей. Просвети себя знаниями в чате и возвращайся уже рептилоидом!';
        
        this.typeText('hamster-typing-text', message, () => {
            document.getElementById('hamster-cursor').style.display = 'none';
            const linkDiv = document.getElementById('hamster-link');
            linkDiv.style.display = 'block';
            linkDiv.style.animation = 'fadeIn 0.5s ease-in';
        });
    }
    
    // Копирование адреса
    copyAddress() {
        const address = document.getElementById('system-address').textContent;
        navigator.clipboard.writeText(address).then(() => {
            const btn = event.target.closest('.copy-btn');
            btn.classList.add('copied');
            btn.innerHTML = '✓';
            setTimeout(() => {
                btn.classList.remove('copied');
                btn.innerHTML = `
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <rect x="5" y="5" width="9" height="9" stroke="currentColor" stroke-width="1.5" rx="1"/>
                        <path d="M3 11V3H11" stroke="currentColor" stroke-width="1.5"/>
                    </svg>
                `;
            }, 2000);
        });
    }
    
    // Вход в основное приложение
    enterMainApp() {
        const authScreen = document.getElementById('auth-screen');
        const welcomeScreen = document.getElementById('welcome-screen');
        const app = document.getElementById('app');
        
        // Скрываем экран авторизации
        if (authScreen) {
            authScreen.style.opacity = '0';
            authScreen.style.transition = 'opacity 0.5s ease-out';
            
            setTimeout(() => {
                authScreen.remove();
                this.showMainApp();
            }, 500);
        } else {
            // Если экрана авторизации нет, скрываем приветственный экран
            if (welcomeScreen) {
                welcomeScreen.style.opacity = '0';
                welcomeScreen.style.transition = 'opacity 0.5s ease-out';
                
                setTimeout(() => {
                    welcomeScreen.style.display = 'none';
                    this.showMainApp();
                }, 500);
            } else {
                this.showMainApp();
            }
        }
    }
    
    // Показать основное приложение
    showMainApp() {
        const app = document.getElementById('app');
        
        app.style.display = 'block';
        app.style.opacity = '0';
        
        // Форсируем reflow
        app.offsetHeight;
        
        app.style.transition = 'opacity 0.5s ease-in';
        app.style.opacity = '1';
        
        // Инициализируем основное приложение
        if (window.app && window.app.initModules) {
            window.app.initModules();
            window.app.startUpdates();
        }
    }
    
    // Анимация печатания текста
    async typeText(elementId, text, callback) {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        for (let i = 0; i < text.length; i++) {
            element.textContent += text[i];
            
            // Случайная вариация скорости
            const delay = this.config.typingSpeed + Math.random() * 20 - 10;
            await this.sleep(delay);
            
            // Пауза после знаков препинания
            if (['.', '!', '?', ')'].includes(text[i])) {
                await this.sleep(200);
            }
        }
        
        if (callback) callback();
    }
    
    // Утилита для задержки
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    // Проверка существующей авторизации
    checkExistingAuth() {
        const authWallet = localStorage.getItem('auth_wallet');
        const authTime = localStorage.getItem('auth_time');
        const isReptiloid = localStorage.getItem('is_reptiloid');
        
        if (authWallet && authTime && isReptiloid === 'true') {
            // Проверяем, не истекла ли сессия (24 часа)
            const timePassed = Date.now() - parseInt(authTime);
            if (timePassed < 24 * 60 * 60 * 1000) {
                console.log('✅ Valid auth session found');
                return true;
            }
        }
        
        // Очищаем устаревшую авторизацию
        localStorage.removeItem('auth_wallet');
        localStorage.removeItem('auth_time');
        localStorage.removeItem('is_reptiloid');
        
        return false;
    }
}

// Создаем глобальный экземпляр
window.authModule = new AuthModule();
