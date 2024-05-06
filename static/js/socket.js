let socket = io();

socket.on('connect', function () {
    console.log('Connected to server');
});

socket.on('disconnect', function () {
    console.log('Disconnected from server');
});

socket.on('user_connected', function (data) {
    let nickname = data.nickname;
    console.log(`${nickname} вошел в игру`);
    let playerList = document.getElementById('player-list');
    let playerItem = document.createElement('li');
    playerItem.textContent = nickname;
    playerList.appendChild(playerItem);
});

// если не установить задержку, 
// веб сокеты будут быстрее отрабатывать чем обновление доски
// и у первого игрока фигура будет исчезать
socket.on('move_piece', function (data) {
    console.log('[MOVE PIECE]', data);
    setTimeout(function () {
        movePiece(data);
        switchPlayer();
        console.log('Board updated successfully.');
    }, 100); 
});


socket.on('message', function (data) {
    let item = document.createElement('li');
    item.textContent = `${data.nickname}: ${data.message}`;
    document.getElementById('messages').appendChild(item);
});

function movePiece(data) {
    const fromRow = data.from_row;
    const fromCol = data.from_col;
    const toRow = data.to_row;
    const toCol = data.to_col;

    const fromCell = document.querySelector(`.cell[data-row="${fromRow}"][data-col="${fromCol}"]`);
    console.log('Откуда', fromCell);
    const toCell = document.querySelector(`.cell[data-row="${toRow}"][data-col="${toCol}"]`);
    console.log('Куда', toCell);


    let attackerCells = document.querySelectorAll('.attacker');
    console.log('[DEF]', attackerCells);

    if (data.player_type === 'attacker') {
        fromCell.innerHTML = ''
        toCell.innerHTML = 'A';
        toCell.classList.add('attacker')
        toCell.classList.add('empty')
        // toCell.classList.remove('attacker')
    }
    if (data.player_type === 'defender') {
        fromCell.innerHTML = ''
        toCell.innerHTML = 'D';
        toCell.classList.add('defender')
        toCell.classList.remove('empty')
        // toCell.classList.remove('attacker')
    }
    toCell.classList.remove('empty')
    fromCell.classList.add('empty')
    fromCell.classList.remove('attacker')
    fromCell.classList.remove('defender')



}

function sendMessage() {
    let message = document.getElementById('message').value;
    socket.emit('message', message);
    document.getElementById('message').value = '';
}
