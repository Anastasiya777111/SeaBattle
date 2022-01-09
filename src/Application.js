class Application {
    player=null;
    opponent=null;

    constructor(){
        const player=new FieldView();
        const opponent=new FieldView();

        Object.assign(this, {player, opponent});

        document.querySelector('[data-side="player"]').append(player.root)
        document.querySelector('[data-side="opponent"]').append(opponent.root)
    }
}