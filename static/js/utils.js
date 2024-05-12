let cells = document.querySelectorAll('.cell');

// эта функция проверяет окружение каждой ячейки на доске, чтобы определить, 
// была ли фишка съедена или находится ли она между двумя вражескими фишками. 
// если фишка была съедена, то она удаляется из ячейки и заменяется пустой ячейкой
function checkSurroundingPieces() {
    cells.forEach(function (cell) {
        let row = parseInt(cell.getAttribute('data-row'));
        let col = parseInt(cell.getAttribute('data-col'));
        let pieceType = cell.classList.contains('attacker') ? 'attacker' : 'defender';

        // проверяем, является ли ячейка небезопасной
        if (!checkClassSafe(row, col)) {
            // проверяем, окружена ли фишка по горизонтали или вертикали и не находится ли она между врагами
            if (PieceHorizontalSurrounded(row, col, pieceType) && !isBetweenEnemies(row, col)) {
                // снова проверка, является ли ячейка безопасной
                if (checkClassSafe(row, col)) {
                    cell.innerHTML = pieceType;
                } else {
                    console.log(`Фишка типа ${pieceType} была съедена в ячейке (${row}, ${col})`);
                    cell.innerHTML = '';
                    cell.classList.add('empty');
                    cell.classList.add('safe');
                    // cell.classList.remove('defender');
                    // cell.classList.remove('attacker');
                }
            }
        }

        if (PieceVerticallySurrounded(row, col, pieceType)) {
            // проверяем снова, является ли ячейка безопасной
            console.log(`Фишка типа ${pieceType} была съедена в ячейке (${row}, ${col})`);
            cell.innerHTML = '';
            cell.classList.add('empty');
            cell.classList.add('safe');
            cell.classList.remove('defender');
            cell.classList.remove('attacker');
        }
        if (!cell.classList.contains('attacker') && !cell.classList.contains('defender')) {
            // если в клетке нет фишки, убираем класс safe
            cell.classList.remove('safe');
        }

        // дополнительная проверка после каждого хода
        cells.forEach(function (cell) {
            let row = parseInt(cell.getAttribute('data-row'));
            let col = parseInt(cell.getAttribute('data-col'));
            let pieceType = cell.classList.contains('attacker') ? 'attacker' : 'defender';

            // если клетка ранее была безопасной, но перестала быть окруженной, убираем у нее класс safe
            if (checkClassSafe(row, col) && !PieceHorizontalSurrounded(row, col, pieceType) && !PieceVerticallySurrounded(row, col, pieceType)) {
                cell.classList.remove('safe');
            }
        });
    });
}



function checkClassSafe(row, col) {
    let cell = getCell(row, col);
    return cell.classList.contains('safe');
}


function getCell(row, col) {
    return document.querySelector(`.cell[data-row='${row}'][data-col='${col}']`);
}


// функция проверяет, находится ли клетка между двумя вражескими фигурами
function isBetweenEnemies(row, col) {
    let leftCell = getCell(row, col - 1);
    let rightCell = getCell(row, col + 1);

    if (leftCell && rightCell) {
        let isLeftEnemy = leftCell.classList.contains("attacker") || leftCell.classList.contains("defender");
        let isRightEnemy = rightCell.classList.contains("attacker") || rightCell.classList.contains("defender");

        if (isLeftEnemy && isRightEnemy) {
            console.log('[True] Клетка между двумя вражескими фигурами');
            return true;
        }
    }

    console.log('[False] Клетка не находится между двумя вражескими фигурами');
    return false;
}


function isEnemyPiece(row, col) {
    let cell = getCell(row, col);
    return cell && !cell.classList.contains('empty') && (cell.classList.contains("attacker") || cell.classList.contains("defender"));
}


function isEmptyCell(row, col) {
    let cell = getCell(row, col);
    return cell && cell.classList.contains('empty');
}


// функция для проверки, окружена ли фишка pieceType с обеих сторон (горизонтально)
function PieceVerticallySurrounded(row, col, pieceType) {
    let leftCol = col - 1;
    let rightCol = col + 1;

    // проверка, что соседние ячейки слева и справа от фишки содержат фишки противника
    if (leftCol >= 0 && rightCol <= 8 &&
        isOpponentPiece(row, leftCol, pieceType) && isOpponentPiece(row, rightCol, pieceType)) {
        return true;
    }

    return false;
}


// функция для проверки, окружена ли фишка pieceType сверху и снизу (вертикально)
function PieceHorizontalSurrounded(row, col, pieceType) {
    let topRow = row - 1;
    let bottomRow = row + 1;

    // проверка, что соседние ячейки сверху и снизу от фишки содержат фишки противника
    if (topRow >= 0 && bottomRow <= 8 &&
        isOpponentPiece(topRow, col, pieceType) && isOpponentPiece(bottomRow, col, pieceType)) {
        return true;
    }

    return false;
}


// функция для проверки, содержит ли клетка фишку противника
function isOpponentPiece(row, col, pieceType) {
    let cell = document.querySelector(`.cell[data-row='${row}'][data-col='${col}']`);
    return cell && !cell.classList.contains('empty') && !cell.classList.contains(pieceType);
}