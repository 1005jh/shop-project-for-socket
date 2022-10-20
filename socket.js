const socketIo = require("socket.io");
const http = require("./app");

const io = socketIo(http);

const socketIdMap = {};

function emitSamePageViewerCount() {
  const countByUrl = Object.values(socketIdMap).reduce((value, url) => {
    return {
      ...value,
      [url]: value[url] ? value[url] + 1 : 1,
    };
  }, {});

  for (const [socketId, url] of Object.entries(socketIdMap)) {
    const count = countByUrl[url];
    io.to(socketId).emit("SAME_PAGE_VIEWER_COUNT", count);
  }
}

io.on("connection", (sock) => {
  socketIdMap[socket.id] = null;
  console.log("누군가 연결했어요!");

  sock.on("CHANGED_PAGE", (data) => {
    console.log("페이지가 바뀌었대요", data, sock.id);
    socketIdMap[socket.id] = data;

    emitSamePageViewerCount();
  });
  const { watchBuying, watchByeBye } = initSocket(sock);

  watchBuying();

  watchByeBye();
});

function initSocket(sock) {
  console.log("새로운 소켓이 연결됐어요!");

  // 특정 이벤트가 전달됐는지 감지할 때 사용될 함수
  function watchEvent(event, func) {
    sock.on(event, func);
  }

  // 연결된 모든 클라이언트에 데이터를 보낼때 사용될 함수
  function notifyEveryone(event, func) {
    io.emit(event, func);
  }

  return {
    watchBuying: () => {
      watchEvent("BUY", (data) => {
        const emitData = {
          nickname: data.nickname,
          goodsId: data.goodsId,
          goodsName: data.goodsName,
          date: new Date().toISOString(),
        };

        notifyEveryone("BUY_GOODS", emitData);
      });
    },
    watchByeBye: () => {
      watchEvent("disconnect", () => {
        delete socketIdMap[socket.id];
        console.log(sock.id, "연결이 끊어졌어요!");
        emitSamePageViewerCount();
      });
    },
  };
}
