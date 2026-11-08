# Host makes a room, then their phone "sleeps" (switching apps to send the code). The friend joins
# while the host is gone; when the host comes back, the two should still connect with the same code.
import asyncio
from playwright.async_api import async_playwright
URL='http://127.0.0.1:8766/index.html?peerhost=127.0.0.1&peerport=9000'
HID="Object.defineProperty(document,'hidden',{configurable:true,get:()=>!!window.__h});"
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch();A=await b.new_page();B=await b.new_page();errs=[]
    for pg in (A,B):
      pg.on('pageerror',lambda e:errs.append(str(e)))
      await pg.goto(URL);await pg.wait_for_function("typeof G!=='undefined'&&G.scene==='title'",timeout=60000);await pg.evaluate(HID)
    code=await A.evaluate("NET.host()");await A.wait_for_function("NET.peer&&NET.peer.open",timeout=10000)
    # host goes to the background: the phone drops the server connection
    await A.evaluate("window.__h=true;NET.peer.socket._socket.close();")
    await A.wait_for_timeout(1500);print('host while asleep:',await A.evaluate("[NET.st,NET.peer.disconnected,NET.code]"))
    await B.evaluate(f"NET.join('{code}')");await B.wait_for_timeout(4000)
    print('friend while host asleep:',await B.evaluate("[NET.st,NET.err]"))
    # host comes back to the game
    await A.evaluate("window.__h=false;document.dispatchEvent(new Event('visibilitychange'))")
    try:
      await B.wait_for_function("NET.st==='connected'||NET.st==='playing'",timeout=20000)
      await A.wait_for_function("NET.st==='connected'||NET.st==='playing'",timeout=5000)
      print('CONNECTED with the same code',code,await A.evaluate("NET.code"))
    except Exception as e: print('FAILED',await A.evaluate("[NET.st,NET.err,NET.code]"),await B.evaluate("[NET.st,NET.err]"))
    print('errors',errs[:3]);await b.close()
asyncio.run(main())
