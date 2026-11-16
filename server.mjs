import http from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {createReadStream,existsSync} from 'node:fs';
import {resolve,extname,dirname,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawn} from 'node:child_process';
const portArg=process.argv.indexOf('--port');
const project=dirname(fileURLToPath(import.meta.url)),game=resolve(project,'dist'),review=resolve(project,'docs/v69'),port=(portArg>=0?Number(process.argv[portArg+1]):0)||Number(process.env.PORT)||5184;
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.glb':'model/gltf-binary','.gltf':'model/gltf+json','.jpg':'image/jpeg','.png':'image/png','.bin':'application/octet-stream','.hdr':'application/octet-stream','.svg':'image/svg+xml','.json':'application/json; charset=utf-8','.mp4':'video/mp4','.md':'text/plain; charset=utf-8'};
const server=http.createServer(async(req,res)=>{try{const name=decodeURIComponent(new URL(req.url,'http://localhost').pathname);if(name==='/__coastline_version'){res.writeHead(200,{'Content-Type':'application/json','Cache-Control':'no-cache'}).end(JSON.stringify({name:'COASTLINE',version:'6.9.0',maps:5,cars:18,serverPid:process.pid}));return;}const isReview=name==='/review'||name.startsWith('/review/'),root=isReview?review:game,relative=isReview?name.replace(/^\/review\/?/,''):name.slice(1),path=resolve(root,relative||'index.html');if(path!==root&&!path.startsWith(root+sep)){res.writeHead(403).end();return;}const file=await stat(path);if(!file.isFile()){res.writeHead(404).end();return;}const headers={'Content-Type':types[extname(path)]||'application/octet-stream','Cache-Control':'no-cache','X-Content-Type-Options':'nosniff','Accept-Ranges':'bytes'};const range=req.headers.range?.match(/^bytes=(\d+)-(\d*)$/);if(range){const start=Number(range[1]),end=Math.min(file.size-1,range[2]?Number(range[2]):file.size-1);if(start>end||start>=file.size){res.writeHead(416,{'Content-Range':`bytes */${file.size}`}).end();return;}res.writeHead(206,{...headers,'Content-Range':`bytes ${start}-${end}/${file.size}`,'Content-Length':end-start+1});createReadStream(path,{start,end}).pipe(res);return;}res.writeHead(200,{...headers,'Content-Length':file.size});if(req.method==='HEAD'){res.end();return;}createReadStream(path).pipe(res);}catch{res.writeHead(404).end('Not found')}});
function openBrowser(){
 const url=`http://127.0.0.1:${port}/?v=6.9`;
 console.log(`\n进入游戏：${url}\n如果浏览器没有自动出现，把上面的地址复制到 Chrome 或 Edge 即可。`);
 if(!process.argv.includes('--open')||process.env.COAST_NO_OPEN==='1')return;
 let child;
 if(process.platform==='win32'){
  child=spawn('rundll32.exe',['url.dll,FileProtocolHandler',url],{stdio:'ignore',detached:true});
 }else child=spawn(process.platform==='darwin'?'open':'xdg-open',[url],{stdio:'ignore'});
 child.on('error',()=>console.error('请手动打开上方游戏地址。'));child.unref();
}
server.on('error',async error=>{if(error.code==='EADDRINUSE'){try{const v=await fetch(`http://127.0.0.1:${port}/__coastline_version`).then(r=>r.json());if(v.name==='COASTLINE'&&String(v.version).startsWith('6.9.')){console.log('游戏已经在运行，正在为你打开游戏入口。');openBrowser();return;}}catch{}console.error(`端口 ${port} 已被其他程序占用。请使用图形启动器自动选择端口，或关闭旧游戏服务后重试。`);process.exitCode=1;}else{console.error(error.message);process.exitCode=1;}});
server.listen(port,'127.0.0.1',()=>{console.log(`COASTLINE V6 ready at http://127.0.0.1:${port}/?v=6.9`);console.log(`Screenshots, videos and verification: http://127.0.0.1:${port}/review/`);openBrowser();});



