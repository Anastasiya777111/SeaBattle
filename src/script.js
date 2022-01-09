const mouse= new Mouse(document.body)

requestAnimationFrame(tick);

function tick(){
    requestAnimationFrame(tick);
    console.log(mouse.left, mouse.prevLeft);

    mouse.tick(0);
}