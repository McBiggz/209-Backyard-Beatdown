const fs=require('fs');const {Document,Packer,Paragraph,TextRun,HeadingLevel,Table,TableRow,TableCell,WidthType,ShadingType,BorderStyle,AlignmentType,LevelFormat}=require('docx');
const C=JSON.parse(fs.readFileSync('c.json','utf8'));const W=9360,kids=[];
const P=(t,o={})=>new Paragraph({spacing:{after:100},...o,children:[new TextRun(t)]});
const box=lines=>new Table({width:{size:W,type:WidthType.DXA},columnWidths:[W],rows:[new TableRow({children:[new TableCell({width:{size:W,type:WidthType.DXA},shading:{type:ShadingType.CLEAR,fill:'F1F1F1',color:'auto'},margins:{top:120,bottom:120,left:160,right:160},
 borders:Object.fromEntries(['top','bottom','left','right'].map(k=>[k,{style:BorderStyle.SINGLE,size:6,color:'BBBBBB'}])),
 children:lines.map(l=>new Paragraph({spacing:{after:l?30:0},children:[new TextRun({text:l,font:'Consolas',size:18})]}))})]})]});
const H1=t=>new Paragraph({heading:HeadingLevel.HEADING_1,pageBreakBefore:true,children:[new TextRun(t)]});
const B=t=>new Paragraph({numbering:{reference:'b',level:0},children:[new TextRun(t)]});
kids.push(new Paragraph({heading:HeadingLevel.TITLE,children:[new TextRun('Backyard Brawl: Full Frame Prompts')]}));
kids.push(P('Every frame the game uses, for every wrestler: 11 sheets, 73 frames, with the extra in-between frames for smoother animation and a 10-frame suplex with exact grip points. Use it for the 1.0 art pass.'));
kids.push(new Paragraph({heading:HeadingLevel.HEADING_2,children:[new TextRun('How to use')]}));
['Make the STYLE REFERENCE first (next section) and keep it.','New ChatGPT chat per wrestler. Attach his character model + the STYLE REFERENCE, paste the SETUP prompt with his name and look line.','When it says "Ready", paste ONE whole sheet box at a time (not just the letter).','For the suplex, paste the GRIP POINTS box once before Sheet G.','Check each sheet: right poses, right order, same size, still him. If not: "redo frame X", or start a fresh chat.','Download the real image (not a screenshot) and send it to Claude with his name and the sheet letter.'].forEach(t=>kids.push(B(t)));
kids.push(new Paragraph({heading:HeadingLevel.HEADING_2,children:[new TextRun('The 11 sheets')]}));
const cw=[900,5260,3200];const cell=(t,w,h)=>new TableCell({width:{size:w,type:WidthType.DXA},shading:h?{type:ShadingType.CLEAR,fill:'2B2B2B',color:'auto'}:undefined,margins:{top:50,bottom:50,left:100,right:100},children:[new Paragraph({children:[new TextRun({text:t,bold:!!h,color:h?'FFFFFF':undefined})]})]});
kids.push(new Table({width:{size:W,type:WidthType.DXA},columnWidths:cw,rows:[new TableRow({tableHeader:true,children:[cell('Sheet',cw[0],1),cell('What',cw[1],1),cell('Frames',cw[2],1)]})].concat(C.sheets.map(([L,t,f])=>new TableRow({children:[cell(L,cw[0]),cell(t,cw[1]),cell(String(f.length),cw[2])]})))}));
kids.push(P('Budget: about 2 images per sheet with redos, so roughly 20-25 images per wrestler, about 550 for the whole roster.',{spacing:{before:160,after:60}}));kids.push(P('Tip: do Sheets A, B and D first. They are on screen the most, so they make the biggest difference.',{spacing:{before:160,after:100}}));
kids.push(H1('Style reference (do this once)'));
kids.push(P('Pick the look for the whole game. Redraw Viral\'s fighting stance (and one new wrestler\'s) with his character model attached and this prompt. Play them in the game before redoing anyone else. When you like it, that image is the STYLE REFERENCE for every chat.'));
kids.push(box(['Redraw this wrestler as a single fighting-stance sprite in true 16-bit SNES fighting-game pixel art: visible square pixels, thin even black outline, limited palette of 16-24 colors, 2-3 flat shading tones per color, no gradients or airbrushing, bold readable shapes. Facing RIGHT. Solid flat magenta background (#FF00FF), no border, no text.']));
kids.push(H1('Setup prompt (once per wrestler chat)'));
kids.push(box(C.setup.split('\n')));
for(const [L,t,f] of C.sheets){if(L==='G'){kids.push(H1('Grip points (paste once, before Sheet G)'));kids.push(P('The 10-frame suplex is drawn one wrestler at a time, and the game lines the two up using these exact grip points. Same points for every wrestler.'));kids.push(box(C.grip.split('\n')));}
 kids.push(H1(`Sheet ${L}: ${t} (${f.length} frames)`));
 kids.push(box([`Sheet ${L}: ${t}. Draw a NEW image: ONE row of exactly ${f.length} frames, left to right, in this order. Follow all the rules. Match the attached STYLE REFERENCE and keep him the same size as before.`+(C.extra[L]?' '+C.extra[L]:'')].concat(f.map((x,i)=>`${i+1}. ${x}`))));
 if(L==='K')kids.push(P('Fill in the [brackets] for each wrestler: his taunt, entrance pose and finisher. See "What Claude needs from you".',{spacing:{before:120}}));}
kids.push(H1('Look lines (paste after LOOK:)'));
for(const [n,t] of C.look){kids.push(new Paragraph({spacing:{before:140,after:40},keepNext:true,children:[new TextRun({text:n,bold:true,color:'7A1F1F'})]}));kids.push(box([t]));}
kids.push(H1('What Claude needs from you'));
['A STYLE REFERENCE you are happy with (the one decision that shapes everything).','For each wrestler: his taunt, entrance pose and finisher (what it looks like), for Sheet K. A quick list in chat is fine.','For the 7 new wrestlers: real height, finisher name, finisher type (kick/slam/other) and fighting style.','Photos of 209 Kliq Enforcer (he has no real art yet).','Corrections to any look line that is wrong (colors, tattoos, gear).','Your keyframes and body-part layers from the Move Checker (tap SEND, paste in chat) once the new art is in.'].forEach(t=>kids.push(B(t)));
const doc=new Document({numbering:{config:[{reference:'b',levels:[{level:0,format:LevelFormat.BULLET,text:'•',alignment:AlignmentType.LEFT,style:{paragraph:{indent:{left:540,hanging:270}}}}]}]},
 styles:{default:{document:{run:{font:'Arial',size:22}},title:{run:{font:'Arial',size:42,bold:true},paragraph:{spacing:{before:0,after:180},keepNext:true}},
 heading1:{run:{font:'Arial',size:32,bold:true,color:'7A1F1F'},paragraph:{spacing:{before:0,after:140},keepNext:true}},heading2:{run:{font:'Arial',size:26,bold:true},paragraph:{spacing:{before:220,after:100},keepNext:true}}}},
 sections:[{properties:{page:{size:{width:12240,height:15840},margin:{top:1080,bottom:1080,left:1440,right:1440}}},children:kids}]});
Packer.toBuffer(doc).then(b=>fs.writeFileSync('/mnt/user-data/outputs/Full_Frame_Prompts.docx',b));
