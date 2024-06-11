let img = document.createElement('img');
img.src = 'static/images/p1.png';
img.classList.add('size-image');
// пример добавления картинки
// toCell.appendChild(img);

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

socket.on('message', function (data) {
    let item = document.createElement('li');
    item.textContent = `${data.nickname}: ${data.message}`;
    document.getElementById('messages').appendChild(item);
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


function movePiece(data) {
    const fromRow = data.from_row;
    const fromCol = data.from_col;
    const toRow = data.to_row;
    const toCol = data.to_col;

//** local storage
    // сохраняем данные о ходе в виде объекта
    const moveData = {
        from_row: fromRow,
        from_col: fromCol,
        to_row: toRow,
        to_col: toCol,
        player_type: data.player_type
    };

    addMoveToLocalStorage(moveData);
    
//**

    const fromCell = document.querySelector(`.cell[data-row="${fromRow}"][data-col="${fromCol}"]`);
    const toCell = document.querySelector(`.cell[data-row="${toRow}"][data-col="${toCol}"]`);

    // определяем класс фигуры
    const playerType = data.player_type;
    const pieceClass = playerType === 'attacker' ? 'attacker' : 'defender';
    const king = fromCell.classList.contains('king')
    // удаляем класс фигуры из начальной ячейки
    fromCell.classList.remove('attacker', 'defender', 'empty');

    // добавляем класс фигуры в конечную ячейку
    toCell.classList.add(pieceClass);
    toCell.classList.remove('empty');
    // проверяем, достиг ли король края доски
    if (king && (toRow === 0 || toRow === 8 || toCol === 0 || toCol === 8)) {
        alert('Король в безопасности! Защитники победили');
    }
    // проверяем, окружен ли король
    isKingSurrounded()
    
    // обновляем содержимое ячеек для отображения фигур
    if (playerType === 'attacker') {
        fromCell.innerHTML = '';
        fromCell.classList.remove('attacker');
        toCell.innerHTML = 'A';
        toCell.classList.add('attacker');
    } else {
        fromCell.innerHTML = '';
        fromCell.classList.remove('defender'); 
        toCell.innerHTML = 'D';
        toCell.classList.add('defender');
    }

    // если идет король, добавляем значение "K" в клетку
    if (king) {
        fromCell.innerHTML = '';
        fromCell.classList.remove('king');
        toCell.innerHTML = 'K';
        toCell.classList.add('king');
    }

    // добавляем класс "empty" к начальной ячейке
    fromCell.classList.add('empty');

    // снимаем выделения со всех клеток
    clearSelection();

    // проверяем окружение фишек после каждого хода
    checkSurroundingPieces();
}



function sendMessage() {
    let message = document.getElementById('message').value;
    socket.emit('message', message);
    document.getElementById('message').value = '';
}