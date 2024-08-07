let cells = document.querySelectorAll('.cell');


function checkSurroundingPieces() {
    cells.forEach(function (cell) {
        let row = parseInt(cell.getAttribute('data-row'));
        let col = parseInt(cell.getAttribute('data-col'));
        let pieceType = cell.classList.contains('attacker') ? 'attacker' : 'defender';

        if (!getClassSafe(row, col)) {
            if (PieceHorizontallySurrounded(row, col, pieceType)) {
                fadeOutPiece(cell, pieceType);
            }
            if (PieceVerticallySurrounded(row, col, pieceType)) {
                fadeOutPiece(cell, pieceType);
            }
        }
        
        // Проверка, если клетка с фишкой перестала быть окруженной и убрать класс safe
        if (cell.classList.contains('safe')) {
            if (!PieceHorizontallySurrounded(row, col, pieceType) && !PieceVerticallySurrounded(row, col, pieceType)) {
                cell.classList.remove('safe');
            }
        }
        
        // Проверяем, является ли клетка пустой
        if (isEmptyCell(row, col)) {
            let leftCell = getCell(row, col - 1);
            let rightCell = getCell(row, col + 1);
            let topCell = getCell(row - 1, col);
            let bottomCell = getCell(row + 1, col);

            // Проверяем, что пустая клетка окружена атакующими с обеих сторон
            if ((leftCell && rightCell && leftCell.classList.contains('attacker') && rightCell.classList.contains('attacker')) ||
                (topCell && bottomCell && topCell.classList.contains('attacker') && bottomCell.classList.contains('attacker'))) {
                cell.innerHTML = '';
                cell.classList.add('safe');
                cell.classList.remove(pieceType);
            }


            // Проверяем, что пустая клетка окружена защитниками с обеих сторон
            if ((leftCell && rightCell && leftCell.classList.contains('defender') && rightCell.classList.contains('defender')) ||
                (topCell && bottomCell && topCell.classList.contains('defender') && bottomCell.classList.contains('defender'))) {
                cell.innerHTML = '';
                cell.classList.add('safe');
                cell.classList.remove(pieceType);
            }

            // Проверяем, что пустая клетка не окружена фишками с обеих сторон
            if (!((leftCell && leftCell.classList.contains('attacker') && rightCell && rightCell.classList.contains('attacker')) ||
                (topCell && topCell.classList.contains('attacker') && bottomCell && bottomCell.classList.contains('attacker')) ||
                (leftCell && leftCell.classList.contains('defender') && rightCell && rightCell.classList.contains('defender')) ||
                (topCell && topCell.classList.contains('defender') && bottomCell && bottomCell.classList.contains('defender')))) {
                cell.innerHTML = '';
                cell.classList.remove(pieceType);
                cell.classList.remove('safe');
            }
        }

        // Проверяем, если клетка с фишкой перестала быть окруженной
        if (cell.classList.contains('attacker') || cell.classList.contains('defender')) {
            pieceType = cell.classList.contains('attacker') ? 'attacker' : 'defender';

            if (!PieceHorizontallySurrounded(row, col, pieceType) && !PieceVerticallySurrounded(row, col, pieceType)) {
                cell.classList.remove('safe');
            }
        }

        if (cell.classList.contains('king')) {
            pieceType = 'defender';
            cell.classList.remove('safe');
            if (!PieceHorizontallySurrounded(row, col, pieceType) && !PieceVerticallySurrounded(row, col, pieceType)) {
                cell.innerHTML = '';
                cell.classList.add('defender');

                let img = document.createElement('img');
                img.src = 'static/images/king.png';
                img.classList.add('size-image');
                cell.appendChild(img);
            } else if (!PieceHorizontallySurrounded(row, col, 'attacker') && !PieceVerticallySurrounded(row, col, 'attacker')) {
                fadeOutPiece(cell, pieceType);
                cell.classList.remove('king');
            }
        }

    });
}
fade out piece

function fadeOutPiece(cell, pieceType) {
    if (cell.classList.contains('attacker') || cell.classList.contains('defender') || cell.classList.contains('king')) {
        cell.classList.add('fade-out');
        setTimeout(function () {
            cell.innerHTML = '';
            cell.classList.remove(pieceType);
            cell.classList.remove('king');
            cell.classList.add('empty');
            cell.classList.remove('fade-out');
        }, 500); // Время должно совпадать с длительностью анимации в CSS
    }
}

function getClassSafe(row, col) {
    let cell = getCell(row, col);
    return cell.classList.contains('safe');
}


function getCell(row, col) {
    return document.querySelector(`.cell[data-row='${row}'][data-col='${col}']`);
}




function isEmptyCell(row, col) {
    let cell = getCell(row, col);
    return cell && cell.classList.contains('empty');
}


// функция для проверки, окружена ли фишка pieceType с обеих сторон (вертикально)
function PieceVerticallySurrounded(row, col, pieceType) {
    let topRow = row - 1;
    let bottomRow = row + 1;

    // проверка, что соседние ячейки сверху и снизу от фишки содержат фишки противника
    if (topRow >= 0 && bottomRow <= 8 &&
        isOpponentPiece(topRow, col, pieceType) && isOpponentPiece(bottomRow, col, pieceType)) {
        return true;
    }

    return false;
}

// функция для проверки, окружена ли фишка pieceType с обеих сторон (горизонтально)
function PieceHorizontallySurrounded(row, col, pieceType) {
    let leftCol = col - 1;
    let rightCol = col + 1;

    // проверка, что соседние ячейки слева и справа от фишки содержат фишки противника
    if (leftCol >= 0 && rightCol <= 8 &&
        isOpponentPiece(row, leftCol, pieceType) && isOpponentPiece(row, rightCol, pieceType)) {
        return true;
    }

    return false;
}



// функция для проверки, содержит ли клетка фишку противника
function isOpponentPiece(row, col, pieceType) {
    let cell = document.querySelector(`.cell[data-row='${row}'][data-col='${col}']`);
    return cell && !cell.classList.contains('empty') && !cell.classList.contains(pieceType);
}

function isKingSurrounded() {
    // найти позицию короля
    let kingCell = document.querySelector('.cell.king');
    if (!kingCell) {
        alert('Игра окончена. Король пал. Конец игры!');
        console.error('Король не найден на доске.');
        // перенаправить пользователя на другую страницу
        localStorage.clear();
        window.location.href = 'menu';
        return false;
    }
    let kingRow = parseInt(kingCell.getAttribute('data-row'));
    let kingCol = parseInt(kingCell.getAttribute('data-col'));

    // проверить, окружен ли король фигурами
    if (PieceHorizontallySurrounded(kingRow, kingCol, 'defender') && PieceVerticallySurrounded(kingRow, kingCol, 'defender')) {
        return true;
    }

    return false;
}


function isMoveValid(from_row, from_col, to_row, to_col) {
    // проверяет, что клетка, куда ходим, пустая
    if (!document.querySelector(`.cell[data-row="${to_row}"][data-col="${to_col}"]`).classList.contains('empty')) {
        return false;
    }

    // проверяет, что ход осуществляется по вертикали или горизонтали
    if (from_row !== to_row && from_col !== to_col) {
        return false;
    }

    // проверяет, что нет других фишек на пути хода
    if (from_row === to_row) {
        const minCol = Math.min(from_col, to_col);
        const maxCol = Math.max(from_col, to_col);
        for (let col = minCol + 1; col < maxCol; col++) {
            if (!document.querySelector(`.cell[data-row="${from_row}"][data-col="${col}"]`).classList.contains('empty')) {
                return false;
            }
        }
    } else if (from_col === to_col) {
        const minRow = Math.min(from_row, to_row);
        const maxRow = Math.max(from_row, to_row);
        for (let row = minRow + 1; row < maxRow; row++) {
            if (!document.querySelector(`.cell[data-row="${row}"][data-col="${from_col}"]`).classList.contains('empty')) {
                return false;
            }
        }
    }

    return true;
}