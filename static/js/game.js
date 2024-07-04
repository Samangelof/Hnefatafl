// изначально ни одна клетка не выбрана
let selectedCell = null;

// начальный игрок который будет ходить
let walkingPlayer = 'attacker'

// сменить игрока
function switchPlayer() {
    walkingPlayer = (walkingPlayer === 'attacker') ? 'defender' : 'attacker';
    updateStepPlayerDisplay();
}
// функция снимает выделение со всех клеток на доске
function clearSelection() {
    document.querySelectorAll('.cell').forEach(cell => {
        cell.classList.remove('selected');
    });
}

//? ****
// Проверяем, был ли уже сделан выбор стороны игрока в прошлом
let player_type = localStorage.getItem('player_type');

// Если выбор еще не был сделан, запрашиваем у пользователя и сохраняем в локальное хранилище
if (!player_type) {
    player_type = confirm('Нажмите "OK" для Атакующей стороны, "Отмена" для защищающей стороны.') ? 'attacker' : 'defender';
    localStorage.setItem('player_type', player_type);
}

// Выводим выбранную сторону в консоль
alert(`Вы выбрали сторону ${player_type}`);
//? ****


document.querySelectorAll('.cell').forEach(cell => {
    cell.addEventListener('click', () => {
        //проверяем, можно ли выбирать фигуру в зависимости от текущего игрока
        if (walkingPlayer === 'attacker') {
            if (cell.classList.contains('defender')) {
                alert('Сейчас ход атакующих');
                return;
            }
        } else if (walkingPlayer === 'defender') {
            if (cell.classList.contains('attacker')) {
                alert('Сейчас ход защитников');
                return;
            }
        }
        const pieceType = cell.classList.contains('attacker') ? 'attacker' : (cell.classList.contains('defender') ? 'defender' : 'empty');
        // определение типа фигуры на клетке
        if ((player_type === 'attacker' && pieceType === 'defender') || (player_type === 'defender' && pieceType === 'attacker')) {
            alert('Игроку запрещено брать фигуры соперника');
            return;
        }
        if (cell.classList.contains('selected')) {
            // eсли клетка уже выбрана, сбрасываем выделение
            cell.classList.remove('selected');
            selectedCell = null;
            return;
        }
        if (selectedCell) {
            // если уже есть выбранная клетка, сбрасываем ее выделение
            selectedCell.classList.remove('selected');
        }
        // После выполнения хода проверяем, не завершена ли игра
        if (selectedCell && cell.classList.contains('empty')) {
            const from_row = parseInt(selectedCell.getAttribute('data-row'));
            const from_col = parseInt(selectedCell.getAttribute('data-col'));
            const to_row = parseInt(cell.getAttribute('data-row'));
            const to_col = parseInt(cell.getAttribute('data-col'));
            // Если выбранная фишка не является королем и целевая клетка - (4, 4), запретить ход
            if (!cell.classList.contains('king') && to_row === 4 && to_col === 4) {
                alert('Неверный ход: больше никому нельзя занимать трон');
                return;
            }
            if (from_row !== to_row && from_col !== to_col) {
                alert('Неверный ход: необходимо перемещаться по горизонтали или вертикали.');
                return;
            }
            if (!isMoveValid(from_row, from_col, to_row, to_col)) {
                alert('Неверный ход: Фишки не могут «прыгать» через другие');
                return;
            }
            

            fetch('/move_piece',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        from_row: from_row,
                        from_col: from_col,
                        to_row: to_row,
                        to_col: to_col,
                        player_type: player_type
                    }),
                }
            ).then(response => {
                if (!response.ok) {
                    throw new Error('Invalid move');
                }
                return response.text();
            }).then(data => {
                console.log('[DATA]', data);
                // Обновление игрового состояния на фронте
                const piece = selectedCell.innerHTML;
                selectedCell.innerHTML = '';
                cell.innerHTML = piece;
                selectedCell.classList.remove('selected');
                cell.classList.add('selected');

                // Удаляем классы defender и attacker из начальной клетки
                selectedCell.classList.remove('defender', 'attacker');
                // Добавляем класс empty к начальной клетке
                selectedCell.classList.add('empty');

                selectedCell = null;

                // Снять выделения со всех клеток
                clearSelection();
            })
                .catch(error => {
                    console.error('Error:', error);
                });
        } else {
            // если нет выбранной клетки, выбираем текущую, если на ней есть фигура
            if (cell.innerHTML.trim()) {
                cell.classList.add('selected');
                selectedCell = cell;
            }
        }
    });
});