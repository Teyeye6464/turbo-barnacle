const connectButton = document.getElementById('connectButton');
const accountInfo = document.getElementById('accountInfo');

if (!connectButton || !accountInfo) {
    console.error('Элементы connectButton или accountInfo не найдены в DOM.');
} else {
    // Инициализация WalletConnect
    const connector = new WalletConnectClient({
        bridge: 'https://bridge.walletconnect.org', // URL сервиса для обмена данными
    });

    // Функция для подключения кошелька
    async function connectWallet() {
        if (!connector.connected) {
            try {
                // Создаем сессию и показываем QR-код
                await connector.createSession();
                if (WalletConnectClient.openQRCodeModal) {
                    WalletConnectClient.openQRCodeModal(connector.uri);
                } else {
                    console.error('Метод openQRCodeModal не найден в WalletConnectClient.');
                }
            } catch (error) {
                console.error('Ошибка при создании сессии:', error);
                accountInfo.textContent = 'Ошибка при создании сессии.';
                return;
            }
        }

        // Обработка успешного подключения
        connector.on('connect', (error, payload) => {
            if (error) {
                console.error('Ошибка подключения:', error);
                accountInfo.textContent = 'Ошибка подключения.';
                return;
            }

            if (!payload.params || !payload.params[0]) {
                console.error('Некорректный формат payload:', payload);
                return;
            }

            // Получаем адрес кошелька
            const { accounts } = payload.params[0];
            const userAccount = accounts[0];
            console.log('Подключенный аккаунт:', userAccount);
            accountInfo.textContent = `Подключенный аккаунт:
${userAccount}`;
        });

        // Обработка обновления сессии
        connector.on('session_update', (error, payload) => {
            if (error) {
                console.error('Ошибка обновления сессии:', error);
                return;
            }

            if (!payload.params || !payload.params[0]) {
                console.error('Некорректный формат payload:', payload);
                return;
            }

            const { accounts } = payload.params[0];
            accountInfo.textContent = `Подключенный аккаунт: ${accounts[0]}`;
        });

        // Обработка отключения
        connector.on('disconnect', (error) => {
            if (error) {
                console.error('Ошибка отключения:', error);
            }
            accountInfo.textContent = 'Кошелек отключен.';
        });
    }

    // Вешаем обработчик на кнопку
    connectButton.addEventListener('click', connectWallet);
}
