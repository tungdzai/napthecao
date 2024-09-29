require('dotenv').config();
const axios = require('axios');
const {HttpsProxyAgent} = require('https-proxy-agent');
const TelegramBot = require('node-telegram-bot-api');
const keep_alive = require('./keep_alive.js');

const token = process.env.TELEGRAM_BOT_TOKEN;
const proxyHost = process.env.PROXY_HOST;
const proxyPort = process.env.PROXY_PORT;
const proxyUser = process.env.PROXY_USER;
const proxyPassword = process.env.PROXY_PASSWORD;
const bot = new TelegramBot(token, {polling: true});
let chatIds = ['1958068409'];

const proxyUrl = `http://${proxyUser}:${proxyPassword}@${proxyHost}:${proxyPort}`;
const agent = new HttpsProxyAgent(proxyUrl);

async function checkProxy() {
    try {
        const response = await axios.get('https://api.ipify.org?format=json', {
            httpAgent: agent,
            httpsAgent: agent
        });
        console.log(`Địa chỉ IP của bạn qua proxy là: ${response.data.ip}`);
        return true; // Proxy hoạt động
    } catch (error) {
        console.error('Lỗi khi kiểm tra proxy:', error.message);
        return false; // Proxy không hoạt động
    }
}

async function sendTelegramMessage(message) {
    for (const id of chatIds) {
        try {
            await bot.sendMessage(id, message);
        } catch (error) {
            console.error(`Lỗi gửi tin nhắn đến Telegram (chatId: ${id}):`, error);
        }
    }
}

async function generateRandomIP() {
    function getRandomOctet() {
        return Math.floor(Math.random() * 256);
    }

    const ip = `${getRandomOctet()}.${getRandomOctet()}.${getRandomOctet()}.${getRandomOctet()}`;
    return ip;
}

async function generateRandomUserName() {
    const lastNames = ["Nguyễn", "Trần", "Lê", "Phạm", "Hoàng", "Vũ", "Võ", "Đặng"];
    const middleNames = ["Việt", "Thị", "Văn", "Hồng", "Minh", "Quang", "Thanh", "Anh"];
    const firstNames = ["Tùng", "Hùng", "Lan", "Anh", "Bình", "Dũng", "Sơn", "Phương"];

    function getRandomElement(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    const userName = `${getRandomElement(lastNames)} ${getRandomElement(middleNames)} ${getRandomElement(firstNames)}`;

    return userName;
}

async function generateRandomDOB() {
    const minYear = 1980;
    const maxYear = 2005;
    const dob = Math.floor(Math.random() * (maxYear - minYear + 1)) + minYear;

    return dob;
}

async function generateRandomGender() {
    const genders = ["Nam", "Nữ"];

    function getRandomElement(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    return getRandomElement(genders);
}

async function generateRandomAddress() {
    const addresses = [
        "Hà Nội",
        "Đà Nẵng",
        "Hải Phòng",
        "Cần Thơ",
        "Huế",
        "Nha Trang",
        "Vũng Tàu",
        "Quảng Ninh",
        "Bắc Ninh",
        "Hoà Bình"
    ];

    function getRandomElement(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    return getRandomElement(addresses);
}

async function luckyDraw(phoneNumber, content) {
    const data = {
        "keyword": "HAO",
        "phone": phoneNumber,
        "code": content
    }
    try {
        const response = await axios.post('https://khuyenmai.mihaohao.vn/v1/prize-codes/lucky-draw', data, {
            headers: {
                'sec-ch-ua-platform': "Windows",
                'Authorization': '',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36',
                'Accept': 'application/json; charset=utf-8',
                'sec-ch-ua': '"Google Chrome";v="129", "Not=A?Brand";v="8", "Chromium";v="129"',
                'Content-Type': 'application/json',
                'sec-ch-ua-mobile': '?0',
                'Sec-Fetch-Site': 'same-origin',
                'Sec-Fetch-Mode': 'cors',
                'Sec-Fetch-Dest': 'empty',
                'Host': 'khuyenmai.mihaohao.vn'
            },
            httpAgent: agent,
            httpsAgent: agent
        });
        return response.data;

    } catch (error) {
        const messages = `Lỗi vòng quy may mắn ${phoneNumber} ${content} ${error}`;
        await sendTelegramMessage(messages);
        console.error(messages);
    }

}

async function payments(phoneNumber, code, amount) {
    const data = {
        "amount": amount,
        "channel": 1,
        "phoneNumber": phoneNumber,
        "code": code,
        "programType": 1
    }

    try {
        const response = await axios.post('https://khuyenmai.mihaohao.vn/v1/payments/multi-channel', data, {
            headers: {
                'sec-ch-ua-platform': "Windows",
                'Authorization': '',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36',
                'Accept': 'application/json; charset=utf-8',
                'sec-ch-ua': '"Google Chrome";v="129", "Not=A?Brand";v="8", "Chromium";v="129"',
                'Content-Type': 'application/json',
                'sec-ch-ua-mobile': '?0',
                'Sec-Fetch-Site': 'same-origin',
                'Sec-Fetch-Mode': 'cors',
                'Sec-Fetch-Dest': 'empty',
                'Host': 'khuyenmai.mihaohao.vn'
            },
            httpAgent: agent,
            httpsAgent: agent
        });
        return response.data;

    } catch (error) {
        const messages = `Lỗi nạp thẻ ${phoneNumber} ${code} ${amount} ${error}`;
        await sendTelegramMessage(messages);
        console.error(messages);
    }

}

async function submitData(phoneNumber, content) {
    let data;
    const address = await generateRandomAddress();
    const dob = await generateRandomDOB();
    const gender = await generateRandomGender();
    const ipClient = await generateRandomIP();
    const userName = await generateRandomUserName();
    data = {
        "address": address,
        "content": content,
        "dob": dob,
        "gender": gender,
        "ipClient": ipClient,
        "userName": userName,
        "phone": phoneNumber,
        "channelId": 1,
        "token": null
    };

    try {
        const response = await axios.post('https://khuyenmai.mihaohao.vn/v1/prize-codes/submit-info', data, {
            headers: {
                'sec-ch-ua-platform': "Windows",
                'Authorization': '',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36',
                'Accept': 'application/json; charset=utf-8',
                'sec-ch-ua': '"Google Chrome";v="129", "Not=A?Brand";v="8", "Chromium";v="129"',
                'Content-Type': 'application/json',
                'sec-ch-ua-mobile': '?0',
                'Sec-Fetch-Site': 'same-origin',
                'Sec-Fetch-Mode': 'cors',
                'Sec-Fetch-Dest': 'empty',
                'Host': 'khuyenmai.mihaohao.vn'
            },
            httpAgent: agent,
            httpsAgent: agent
        });
        const status = response.data.Status;
        if (status === -4) {
            const phoneInvalid = `Số điện thoại không hớp lệ ${phoneNumber}`
            await sendTelegramMessage(phoneInvalid);
        } else if (status === 3) {
            const codeUsed = `Mã được sử dụng ${content}`;
            await sendTelegramMessage(codeUsed);

        } else if (status === 4) {
            const wrongCode = `Mã không hợp lệ ${content}`
            await sendTelegramMessage(wrongCode);
        } else if (status === -1) {
            const block = `Số điện thoại bị chặn ${phoneNumber}`
            await sendTelegramMessage(block);
        }
        console.log(response.data)
        if (status === 1) {
            const result = await luckyDraw(phoneNumber, content);
            if (result) {
                const amount = result.Award.AmountTopup;
                const statusTopUp = await payments(phoneNumber, content, amount);
                if (statusTopUp.HasWallet) {
                    await sendTelegramMessage(`${phoneNumber} nạp thành công ${amount}`);
                } else {
                    await sendTelegramMessage(`Nạp thành công với SĐT: ${phoneNumber} với mã code: ${content}`);
                }
            } else {
                await sendTelegramMessage(`Lỗi dữ liệu vòng quay ${phoneNumber} với mã code: ${content} `);

            }
        }


    } catch (error) {
        const messages = `Lỗi khi gửi dữ liệu: ${error}`;
        await sendTelegramMessage(messages);
        console.error(messages);
    }

}

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    const regex = /^(\d{10})\s+(\w+)$/;
    const match = text.match(regex);

    if (match) {
        const phoneNumber = match[1];
        const content = match[2];
        await checkProxy().then(async isProxyWorking => {
            if (isProxyWorking) {
                await submitData(phoneNumber, content);
            } else {
                console.error("Proxy không hoạt động. Dừng lại.");
            }
        });

    } else {
        await bot.sendMessage(chatId, 'Vui lòng nhập theo định dạng: <số điện thoại> <mã thẻ>');
    }
});
