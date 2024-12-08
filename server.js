const WebSocket = require('ws');
const url = require('url');

// サーバーを作成
const server = new WebSocket.Server({ port: 8080 });

const rooms = {}; // 部屋ごとにクライアントを管理

server.on('connection', (ws, req) => {
    const roomID = url.parse(req.url, true).query.room; // URLから部屋IDを取得
    if (!roomID) {
        ws.close(); // 部屋IDがない場合は接続を閉じる
        return;
    }

    // 部屋を作成または既存部屋に参加
    if (!rooms[roomID]) {
        rooms[roomID] = [];
    }
    rooms[roomID].push(ws);

    console.log(`新しいクライアントが部屋 "${roomID}" に接続しました`);

    // メッセージ受信時
    ws.on('message', (message) => {
        console.log(`[部屋 ${roomID}] 受信: ${message}`);
        // 同じ部屋のクライアントに送信
        rooms[roomID].forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    });

    // クライアント切断時
    ws.on('close', () => {
        console.log(`クライアントが部屋 "${roomID}" を切断しました`);
        rooms[roomID] = rooms[roomID].filter((client) => client !== ws);

        // 部屋が空になったら削除
        if (rooms[roomID].length === 0) {
            delete rooms[roomID];
            console.log(`部屋 "${roomID}" が削除されました`);
        }
    });
});

console.log('WebSocketサーバーがポート8080で待機しています');
