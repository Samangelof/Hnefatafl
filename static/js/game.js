// изначально ни одна клетка не выбрана
let selectedCell = null;
// начальный игрок который будет ходить
let walkingPlayer = 'attacker'
// сменить игрока
function switchPlayer() {
    if (walkingPlayer === 'attacker') {
        walkingPlayer = 'defender';
    } else {
        walkingPlayer = 'attacker';
    }
}
// функция снимает выделение со всех клеток на доске
function clearSelection() {
    document.querySelectorAll('.cell').forEach(cell => {
        cell.classList.remove('selected');
    });
}


let player_type = confirm('Выберите сторону: attacker или defender. Нажмите "OK" для attacker, "Отмена" для defender.');

if (player_type) {
    console.log('Вы выбрали сторону attacker');
    player_type = 'attacker';
} else {
    console.log('Вы выбрали сторону defender');
    player_type = 'defender';
}


document.querySelectorAll('.cell').forEach(cell => {
    cell.addEventListener('click', () => {
        const pieceType = cell.classList.contains('attacker') ? 'attacker' : (cell.classList.contains('defender') ? 'defender' : 'empty');
        
        // проверяем, можно ли выбирать фигуру в зависимости от текущего игрока
        if ((pieceType === 'attacker' && cell.classList.contains('defender')) ||
            (pieceType === 'defender' && cell.classList.contains('attacker'))) {
            console.log('Нельзя выбирать фигуры соперника');
            return;
        }
        // определение типа фигуры на клетке
        if ((player_type === 'attacker' && pieceType === 'defender') || (player_type === 'defender' && pieceType === 'attacker')) {
            console.log('Игроку запрещено брать фигуры соперника');
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

        if (selectedCell && cell.classList.contains('empty')) {
            const from_row = parseInt(selectedCell.getAttribute('data-row'));
            const from_col = parseInt(selectedCell.getAttribute('data-col'));
            const to_row = parseInt(cell.getAttribute('data-row'));
            const to_col = parseInt(cell.getAttribute('data-col'));
            
            if (!isMoveValid(from_row, from_col, to_row, to_col)) {
                console.log('Неверный ход: проверьте правила перемещения фигур.');
                return;
            }
            if (from_row !== to_row && from_col !== to_col) {
                console.log('Неверный ход: необходимо перемещаться по горизонтали или вертикали.');
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
                        player_type: player_type  // здесь нужно учитывать тип игрока
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
