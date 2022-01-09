class FieldView extends Field {
    root=null;
table=null;
dock=null;
polygon=null;

constructor(){
    const root=document.createElement('div');
    root.classList.add('fieldOfBattle');

    const table=document.createElement('table');
    table.classList.add('fieldOfBattle-table');

    const dock=document.createElement('div');
    dock.classList.add('fieldOfBattle-dock');

    const polygon=document.createElement('div');
    polygon.classList.add('fieldOfBattle-polygon');

    Object.assign(this, {root, table, dock, polygon});
}
}