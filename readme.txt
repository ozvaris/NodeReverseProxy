https://stackoverflow.com/questions/41497674/access-control-allow-origin-issue-when-api-call-made-from-react-isomorphic-ap
1 - Create a Node.js project (Middleware) and use below code in app.js.
This will pass the request http://localhost:5000/api/xxx to original server (for example http://localhost:8080/api/xxx), and returns the result to client.
2-Change client (React) to call proxy and get data without CORS error (you only need to change the port in url):
axios.get('http://localhost:5000/api/xxx', //proxy uri
{
   headers: {
      authorization: ' xxxxxxxxxx' ,
      'Content-Type': 'application/json'
   } 
}).then(function (response) {
   console.log(response);
});
3-run node project node app.js and react project npm start.

forward localhost 5000 to https://suggest.taobao.com/