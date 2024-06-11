function addMoveToLocalStorage(moveData) {
    // получаем текущие ходы из локального хранилища (если есть)
    let moves = JSON.parse(localStorage.getItem('moves')) || [];

    // добавляем новый ход к остальным ходам
    moves.push(moveData);

    // обновляем данные в локальном хранилище
    localStorage.setItem('moves', JSON.stringify(moves));
}

function renderMovesFromLocalStorage() {
    let moves = JSON.parse(localStorage.getItem('moves')) || [];

    moves.forEach(moveData => {
        // Применяем каждый ход к доске
        movePiece(moveData);
    });
}

// Вызываем функцию при загрузке страницы, чтобы отобразить ходы из локального хранилища
// renderMovesFromLocalStorage();

localStorage.clear();