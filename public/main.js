!function(){"use strict";function t(t,e){if(0===e.r)return!1;const o=e.x-t.x,n=e.y-t.y;return o*o+n*n<=e.r*e.r}function e(t,e){const o=e.x-t.x,n=e.y-t.y;return{x:o,y:n,length:Math.sqrt(Math.pow(o,2)+Math.pow(n,2))}}function o(t,e){const{trueAnomaly:o}=t.orbit;return function(t,e){const{GM:o,semimajor:n,eccentricity:a,periapsisArgument:i}=t.orbit,r=n*(1-Math.pow(a,2))/(1+a*Math.cos(e)),s=Math.atan2(a*Math.sin(e),1+a*Math.cos(e)),h=Math.sqrt(o*(2/r-(1-n))),c=e+i;return{x:Math.cos(c)*r,y:-Math.sin(c)*r,flightAngle:s,v:h}}(t,o+e)}const n=149597870.7,a=[1e5,.117,.616,.924,.0661,.578,48.2,54.5,51.9,86.2,.0661].map((t=>t*Math.pow(10,6)/n)),i=[696340,2439.7,6051.8,6371,1737.4,3389.5,69911,58232,25362,24622,1188.3].map((t=>t/n)),r=["Sun","Mercury","Venus","Earth","Moon","Mars","Jupiter","Saturn","Uranus","Neptune","Pluto"],s=["hsl(60, 80%, 50%)","hsl(0, 0%, 60%)","hsl(0, 30%, 60%)","hsl(220, 80%, 60%)","hsl(0, 0%, 75%)","hsl(0, 80%, 60%)","hsl(30, 80%, 60%)","hsl(45, 80%, 60%)","hsl(190, 80%, 60%)","hsl(200, 80%, 60%)","hsl(30, 10%, 60%)"];const{MassProduct:h}=window.Astronomy;const c=[1,5,25,100,500,1e3,5e3,1e4,5e4];let l=1;const{BaryState:u,Body:d,MassProduct:y}=window.Astronomy,w=1.496*Math.pow(10,8),x=document.querySelector("#scene"),m=document.querySelector("#canvas"),M=document.querySelector("#speed"),v=document.querySelector("#ship"),p=document.querySelector("#fire"),f=document.querySelector("#throttle"),g=document.querySelector(".button.locate"),b=document.querySelector("#intro");document.querySelector("#keys").textContent="up = throttle, left/right = turn, 1–9 speed of simulation, +/- = zoom";let L=0,q=0;const P={x:0,y:0},S=m.getContext("2d"),E={},$=[];g.onclick=()=>{g.classList.add("disabled"),D&&(D=!1,H=A,b.textContent=""),L=0,P.x=0,P.y=0},f.onmousedown=f.ontouchstart=t=>{const e=f.querySelector(".bar"),o=f.querySelector(".amount"),n=f.clientHeight,a={y:(t.touches?t.touches[0]:t).pageY},i=C.throttle;function r(t){const r=(t.touches?t.touches[0]:t).pageY-a.y;C.throttle=i-r/n,C.throttle=Math.max(0,Math.min(1,C.throttle)),o.textContent=`${Math.round(100*C.throttle)} %`,e.style.height=100*C.throttle+"%"}function s(t){window.removeEventListener("mousemove",r),window.removeEventListener("mouseup",s),f.removeEventListener("touchmove",r),f.removeEventListener("touchend",s)}window.addEventListener("mousemove",r),window.addEventListener("mouseup",s),f.addEventListener("touchmove",r),f.addEventListener("touchend",s)},[["up",38],["left",37],["right",39],["plus","+"],["minus","-"]].forEach((([t,e])=>{const o=document.querySelector(`.${t}`),n=function(){E[e]=!1,o.onmouseup=o.onmouseleave=o.ontouchend=null,o.classList.remove("active")};o.onmousedown=o.ontouchstart=()=>{E[e]=!0,o.onmouseup=o.onmouseleave=o.ontouchend=n,o.classList.add("active")}})),["backward","forward"].forEach((t=>{const e=document.querySelector(`.${t}`),o=function(){e.onmouseup=e.onmouseleave=e.ontouchend=null,e.classList.remove("active")};e.onmousedown=e.ontouchstart=()=>{e.onmouseup=e.onmouseleave=e.ontouchend=o,"forward"===t?l+=1:"backward"===t&&(l-=1),l=Math.max(1,l),l=Math.min(9,l),e.classList.add("active")}})),window.addEventListener("keydown",(t=>{"+"===t.key||"-"===t.key?(E[t.key]=!0,"+"===t.key?document.querySelector(".button.plus").classList.add("active"):document.querySelector(".button.minus").classList.add("active")):(E[t.which]=!0,38===t.which?document.querySelector(".button.up").classList.add("active"):37===t.which?document.querySelector(".button.left").classList.add("active"):39===t.which&&document.querySelector(".button.right").classList.add("active"))})),window.addEventListener("keyup",(t=>{"+"===t.key||"-"===t.key?(E[t.key]=!1,"+"===t.key?document.querySelector(".button.plus").classList.remove("active"):document.querySelector(".button.minus").classList.remove("active")):(E[t.which]=!1,38===t.which?document.querySelector(".button.up").classList.remove("active"):37===t.which?document.querySelector(".button.left").classList.remove("active"):39===t.which&&document.querySelector(".button.right").classList.remove("active"))}));const k=5,I=5e10,A=5e10;let H=5,D=!0;const W=Date.now();let Y=0,T=W,F=Date.now(),X=0;const C=new class{constructor({x:t,y:e,r:o,ra:n,attached:a,throttle:i}){this.x=t,this.y=e,this.r=o,this.ra=n,this.vx=0,this.vy=0,this.attached=a,this.throttle=i}}({r:-90.2,x:0*i[3],y:1*i[3],ra:0,attached:3,throttle:1}),R={x:0,y:0};function B(n,a){const s=window.devicePixelRatio||1;T+=n;const u=1e3/n*86400,d=1e3/n;C.future=[];let w=C.x,x=C.y,m=C.vx,M=C.vy;const{x:v,y:p}=$[C.attached];C.gravity=function(t,o){const n=e(t,o),a=o.gm/Math.pow(n.length,2),i=a*n.x/n.length,r=a*n.y/n.length;return{x:i,y:r,direction:Math.atan2(i,r),length:a}}({x:v+C.x,y:p+C.y},{x:v,y:p,gm:y(r[C.attached])}),m+=C.gravity.x/u,M+=C.gravity.y/u,w+=m/u,x+=M/u;if(t({x:v+w,y:p+x},{x:v,y:p,r:i[C.attached]})){const t=-C.x,e=-C.y,o=Math.atan2(e,t),n=Math.cos(o)*i[C.attached],a=Math.sin(o)*i[C.attached];w=(t*n>0?-1:1)*n,x=(e*a>0?-1:1)*a,m=0,M=0}if(C.x=w,C.y=x,C.vx=m,C.vy=M,C.v=Math.sqrt(Math.pow(C.vx,2)+Math.pow(C.vy,2)),!D&&E[38]){Y||(Y=Date.now()),l>3&&(l=3);const t=4*C.throttle*.5,e=Math.cos(C.r*Math.PI/180)*t,o=-Math.sin(C.r*Math.PI/180)*t;C.vx+=e/u,C.vy+=o/u,C.acc=1}else C.acc=0;if(!a){if(E[49]?l=1:E[50]?l=2:E[51]?l=3:E[52]?l=4:E[53]?l=5:E[54]?l=6:E[55]?l=7:E[56]?l=8:E[57]&&(l=9),E[38]&&l>3&&(l=3),l>1){const t=c[l-1]/3;for(let e=0;e<t;e++)B(50,!0)}if(E[37]&&(C.r-=60/d),E[39]&&(C.r+=60/d),D||(0===L&&(E["+"]||E["-"])&&(P.x=0,P.y=0,L=-1,g.classList.remove("disabled")),E["+"]&&G(5,{x:.5,y:.5}),E["-"]&&G(-5,{x:.5,y:.5})),C.orbit=function(t,e,o){const n=Math.sqrt(Math.pow(e.x,2)+Math.pow(e.y,2)),a=Math.sqrt(Math.pow(e.vx,2)+Math.pow(e.vy,2)),i=h(t),r=Math.atan2(e.x,e.y)-Math.atan2(e.vx,e.vy),s=Math.PI/2-r,c=2*i/(n*Math.pow(a,2)),l=Math.pow(c,2)-4*(1-c)*-Math.pow(Math.sin(r),2),u=n*((-c+Math.sqrt(l))/(2*(1-c))),d=n*((-c-Math.sqrt(l))/(2*(1-c))),y=Math.sqrt(Math.pow(n*Math.pow(a,2)/i-1,2)*Math.pow(Math.sin(r),2)+Math.pow(Math.cos(r),2)),w=1/(2/n-Math.pow(a,2)/i),x=Math.atan2(n*Math.pow(a,2)/i*Math.sin(r)*Math.cos(r),n*Math.pow(a,2)/i*Math.pow(Math.sin(r),2)-1),m=Math.sqrt(Math.pow(w,2)*(1-y)),M=Math.atan2(e.y,e.x)-x,v=Math.acos((y+Math.cos(x))/(1+y*Math.cos(x)));return{calculatedAt:o,eccentricity:y,rp:u,ra:d,trueAnomaly:x,flightAngle:s,semimajor:w,semiminor:m,periapsisArgument:M,GM:i,zenithAngle:r,meanMotion:Math.sqrt(i/Math.pow(w,3)),meanAnomaly:v-y*Math.sin(v)}}(r[C.attached],C,T),C.orbitPoints=function(e,n,a){const r=[],s=[],{x:h,y:c}=o(a,0),{x:l,y:u}=o(a,Math.PI/144e4),d=-(u-c);let y=1;((l-h)*a.vx<0||d*a.vy<0)&&(y=-1);for(let t=0;t<Math.PI/256;t+=Math.PI/72e4)r.push(t);for(let t=Math.PI/256;t<Math.PI;t+=Math.PI/9e3)r.push(t);for(let t=-Math.PI;t<-Math.PI/256;t+=Math.PI/9e3)r.push(t);for(let t=-Math.PI/256;t<=0;t+=Math.PI/72e4)r.push(t);for(let e=0;e<r.length;e++){const h=r[e],{x:c,y:l,v:u}=o(a,y*h);if(Number.isNaN(u))return a.orbit.hyperbolic=!0,s;a.orbit.hyperbolic=!1;const{x:d,y:w}=n[a.attached];s.push({x:c,y:l});const{x:x,y:m}=n[a.attached];if(t({x:d+c,y:w+l},{x:x,y:m,r:i[a.attached]}))return a.orbit.collide=!0,s;a.orbit.collide=!1}return s}(0,$,C),C.orbitPoints.length>2){const t=Math.min(...C.orbitPoints.map((({x:t,y:e})=>t))),e=Math.max(...C.orbitPoints.map((({x:t,y:e})=>t))),o=Math.min(...C.orbitPoints.map((({x:t,y:e})=>e))),n=Math.max(...C.orbitPoints.map((({x:t,y:e})=>e)));C.orbit.x=t+(e-t)/2,C.orbit.y=-(o+(n-o)/2),C.orbit.w=e-t,C.orbit.h=n-o}else C.orbit.x=null,C.orbit.y=null;if(D)if(g.classList.remove("disabled"),E[27]&&(D=!1,H=A,g.classList.add("disabled")),H<A){const t=Date.now()-W;b.textContent=t<1e3?"":t<3e3?"Welcome to Flanets!":t<5500?"Fly around in your space ship with realistic gravity":t<8e3?"and planets where they actually are right now in our galaxy":t<11e3?"Source open at github.com/pakastin/flanets":"Have fun!";G(H<80?1+H/80*1:H<250?2+2*H/200:4,{x:.5,y:.5})}else g.classList.add("disabled"),D=!1,b.textContent=""}if(0===L&&!C.orbit.hyperbolic&&C.orbitPoints.length>2){const t=Math.min(I,Math.min(.4*window.innerWidth*s/C.orbit.w,.4*window.innerHeight*s/C.orbit.h));H+=.01*(t-H)}}function N(){let t;if(r.forEach(((t,e)=>{if(0===e)return void($[e]={x:0,y:0});const{x:o,y:n}=function(t,e){return u(d[t],new Date(e))}(r[e],T);$[e]={x:o,y:n}})),r.forEach(((o,n)=>{const i=a[n],{length:r}=e({x:$[C.attached].x+C.x,y:$[C.attached].y+C.y},$[n]);r<i&&(t=n)})),null!=t&&t!==C.attached&&q<T-36e5){q=T;const e=$[C.attached].x+C.x,o=$[C.attached].y+C.y;C.attached=t,C.x=e-$[C.attached].x,C.y=o-$[C.attached].y}}function G(t,e){const o=window.devicePixelRatio||1,n=H;H+=t*H*.01,H<k?H=k:H>I&&(H=I);const a=(e.x*window.innerWidth-window.innerWidth/2)*o,i=(e.y*window.innerHeight-window.innerHeight/2)*o,r=a/H-a/n,s=i/H-i/n;P.x+=r,P.y+=s}function j(t){return t<0&&(t+=360),("00"+Math.round(t||0)%360).slice(-3)+"°"}C.future=[],N(),B(1e3/60),setInterval((t=>{const e=Date.now()-F;for(X+=e;X>t;)X-=t,B(t);F=Date.now()}),1e3/60,1e3/60),setInterval(N,1e3/60),window.addEventListener("touchstart",(t=>{t.preventDefault()})),window.addEventListener("touchmove",(t=>{t.preventDefault()})),x.onmousedown=x.ontouchstart=t=>{let e,o,n;t.preventDefault();const a=(t.touches?t.touches[0]:t).pageX,i=(t.touches?t.touches[0]:t).pageY,r={},s={x:P.x,y:P.y},h=t=>{if(t.preventDefault(),D)return;const h=window.devicePixelRatio||1;if(t.touches&&2===t.touches.length){const a={x:t.touches[0].pageX,y:t.touches[0].pageY},i={x:t.touches[1].pageX,y:t.touches[1].pageY},r={x:a.x+(i.x-a.x),y:a.y+(i.y-i.y)},h=Math.sqrt(Math.pow(i.x-a.x,2)+Math.pow(i.y-a.y,2));if(e&&2===e.length){const t={x:e[0].pageX,y:e[0].pageY},a={x:e[1].pageX,y:e[1].pageY},i=Math.sqrt(Math.pow(a.x-t.x,2)+Math.pow(a.y-t.y,2)),c=o;H*=h/i;const l={x:r.x-window.innerWidth/2,y:r.y-window.innerHeight/2},u={x:l.x/H-l.x/c,y:l.y/H-l.y/c};0===L&&(P.x=0,P.y=0,s.x=0,s.y=0,L=-1,g.classList.remove("disabled")),P.x=n.x+u.x,P.y=n.y+u.y}return e=t.touches,o=H,void(n={...P})}e=t.touches,o=H,n={...P},0===L&&(P.x=0,P.y=0,s.x=0,s.y=0,L=-1,g.classList.remove("disabled"));const c=(t.touches?t.touches[0]:t).pageX,l=(t.touches?t.touches[0]:t).pageY;r.x=(c-a)/H*h,r.y=(l-i)/H*h,P.x=s.x+r.x,P.y=s.y+r.y},c=()=>{window.removeEventListener("mousemove",h),window.removeEventListener("touchmove",h),window.removeEventListener("mouseup",c),window.removeEventListener("touchend",c)};window.addEventListener("mousemove",h),window.addEventListener("touchmove",h),window.addEventListener("mouseup",c),window.addEventListener("touchend",c)},window.addEventListener("wheel",(t=>{0===t.deltaY||D||(L>-1&&(P.x=0,P.y=0,L=-1,g.classList.remove("disabled")),G(-t.deltaY/16,{x:t.pageX/window.innerWidth,y:t.pageY/window.innerHeight}))}),{passive:!1}),function t(){window.requestAnimationFrame(t);const e=window.devicePixelRatio||1;S.scale(e,e);const o=window.innerWidth/2,n=window.innerHeight/2,a=window.innerWidth*e/2,h=window.innerHeight*e/2;0===L?(R.x=-($[C.attached].x+C.x),R.y=$[C.attached].y+C.y):(R.x=-($[C.attached].x+C.x)+P.x,R.y=$[C.attached].y+C.y+P.y);const u=Math.max(D?0:15,H/1e9),d=$[C.attached].x+C.x,y=$[C.attached].y+C.y,x=`translate(${o+(R.x+d)*H/e}px, ${n+(R.y-y)*H/e}px) rotate(${C.r}deg) scale(${u})`;v.style.transform=x,E[38]&&!E[16]&&C.throttle?p.style.opacity="":p.style.opacity=0,m.style.width=window.innerWidth+"px",m.style.height=window.innerHeight+"px",m.width=window.innerWidth*e,m.height=window.innerHeight*e;const f=C.orbitPoints.map((({x:t,y:e},o)=>({x:a+(R.x+$[C.attached].x+t)*H,y:h+(R.y-$[C.attached].y+e)*H})));S.fillStyle="hsl(270, 60%, 10%)",S.fillRect(0,0,window.innerWidth,window.innerHeight),S.beginPath(),f.forEach((({x:t,y:e},o)=>{S[o?"lineTo":"moveTo"](t,e)})),S.lineWidth=1.5*e,S.strokeStyle="hsl(0, 0%, 90%)",S.stroke(),r.forEach(((t,o)=>{const{x:n,y:c}=$[o],l=Math.max(3,i[o]*H);"Earth"===r[o]&&(S.beginPath(),S.arc(a+(R.x+n)*H,h+(R.y-c)*H,1.015*l,0,2*Math.PI),S.fillStyle=s[o].replace("hsl","hsla").replace(")",", 0.25)"),S.fill()),S.beginPath(),S.arc(a+(R.x+n)*H,h+(R.y-c)*H,l,0,2*Math.PI),S.fillStyle=s[o],S.fill(),S.font=(e>1?16:8)+"px -apple-system, BlinkMacSystemFont, avenir next, avenir, segoe ui, helvetica neue, helvetica, Ubuntu, roboto, noto, arial, sans-serif",S.textAlign="center",S.textBaseline="top";const u=a+(R.x+n)*H,d=h+(R.y-c)*H+l+(e>1?12:9);S.fillStyle="hsla(0, 0%, 0%, 0.9)",S.fillText(r[o],u-1,d-1),S.fillText(r[o],u+1,d-1),S.fillText(r[o],u-1,d+1),S.fillText(r[o],u+1,d+1),S.fillStyle="hsla(0, 0%, 100%, 0.9)",S.fillText(r[o],u,d)}));const g=Math.sqrt(Math.pow(C.vx,2)+Math.pow(C.vy,2)),b=Math.sqrt(Math.pow(C.x,2)+Math.pow(C.y,2))-i[C.attached],q=180*Math.atan2(C.vx,C.vy)/Math.PI;let k=Math.round(90+C.r-q);k<-180?k+=360:k>180&&(k-=360),M.innerHTML=`${new Date(T).toLocaleString()}${l>1?` (${function(t){return t>1?c[t-1]+"x":""}(l)})`:""}<br>${j(q)} (${(k>0?"+":"")+k}° → ${j(90+C.r)})<br>${function(t){const e=t*w/24;return Math.round(e)+" km/h"}(g)}${C.acc?` (+${(4*C.throttle).toFixed(2)} G)`:""}, ${function(t){const e=t*w;return e<2?Math.round(1e3*e)+" m":e<10?e.toFixed(2)+" km":e<100?e.toFixed(1)+" km":Math.round(e)+" km"}(b)}<br>${Y?function(t){const e=Math.floor(t/1e3)%60,o=Math.floor(t/1e3/60)%60,n=Math.floor(t/1e3/60/60)%24,a=Math.floor(t/1e3/60/60/24);return a?`T+${a}:${i(n)}:${i(o)}:${i(e)}`:`T+${i(n)}:${i(o)}:${i(e)}`;function i(t){return("0"+t).slice(-2)}}(T-Y):""}`}()}();
