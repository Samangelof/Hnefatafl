// let img = document.createElement('img');
// img.src = 'static/images/p1.png';
// img.classList.add('size-image');
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

    // проверка чтобы никнейм не дублировался
    let existingItem = Array.from(playerList.children).find(item => item.textContent === nickname);
    if (!existingItem) {
        let playerItem = document.createElement('li');
        playerItem.textContent = nickname;
        playerList.appendChild(playerItem);
    }
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

    // определяем класс фигуры и изображение
    const playerType = data.player_type;
    let pieceClass, imgSrc;
    if (playerType === 'attacker') {
        pieceClass = 'attacker';
        imgSrc = 'static/images/p1.png';
    } else if (playerType === 'defender') {
        pieceClass = 'defender';
        imgSrc = 'static/images/p2.png';
    }

    // определяем, является ли фигура королем
    const king = fromCell.classList.contains('king');
    if (king) {
        pieceClass = 'king';
        imgSrc = 'static/images/king.png';
    }
    // удаляем класс фигуры из начальной ячейки
    fromCell.innerHTML = '';
    fromCell.classList.remove('attacker', 'defender', 'king', 'empty');

    // добавляем класс фигуры в конечную ячейку
    toCell.classList.add(pieceClass);
    toCell.classList.remove('empty');
    
    // обновляем содержимое ячеек для отображения фигур
    if (playerType === 'attacker') {
        fromCell.innerHTML = '';
        fromCell.classList.remove('attacker');
        toCell.innerHTML = '';
        toCell.classList.add('attacker');

        let img = document.createElement('img');
        img.src = 'static/images/p1.png';
        img.classList.add('size-image');
        toCell.appendChild(img);
    } else {
        fromCell.innerHTML = '';
        fromCell.classList.remove('defender'); 
        toCell.innerHTML = '';
        toCell.classList.add('defender');

        let img = document.createElement('img');
        img.src = 'static/images/p2.png';
        img.classList.add('size-image');
        toCell.appendChild(img);
    }

    // проверяем, достиг ли король края доски
    if (king && (toRow === 0 || toRow === 8 || toCol === 0 || toCol === 8)) {
        alert('Король в безопасности! Защитники победили');
        localStorage.clear();
        window.location.href = 'menu';

    }

    // добавляем класс "empty" к начальной ячейке
    fromCell.classList.add('empty');

    // снимаем выделения со всех клеток
    clearSelection();

    // проверяем окружение фишек после каждого хода
    checkSurroundingPieces();

    // проверяем, окружен ли король
    isKingSurrounded();
}

function updateStepPlayerDisplay() {
    const turnElement = document.getElementById('current-turn');
    if (walkingPlayer === 'attacker') {
        turnElement.textContent = 'Ход атакующих';
    } else {
        turnElement.textContent = 'Ход защитников';
    }
}

function sendMessage() {
    let message = document.getElementById('message').value;
    socket.emit('message', message);
    document.getElementById('message').value = '';
}