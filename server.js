const http = require("./app");
require(".socket.js"); //socket에 http 있어서

http.listen(8080, () => {
  console.log("서버가 요청을 받을 준비가 됐어요");
});
