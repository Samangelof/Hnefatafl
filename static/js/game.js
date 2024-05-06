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

function sendMove(from_row, from_col, to_row, to_col, player_type) {
    fetch('/move_piece', {
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
    }).then(response => {
        if (!response.ok) {
            throw new Error('Invalid move');
        }
        return response.text();
    }).catch(error => {
        console.error('Error:', error);
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


// const player_type = 'attacker';

// const player_type = prompt('Выберите сторону: attacker или defender');
// if (player_type !== 'attacker' && player_type !== 'defender') {
//     alert('Неверный выбор стороны. Пожалуйста, выберите attacker или defender.');
//     // можно добавить код для повторного запроса стороны или прерывания игры
// }
let attackerCells = document.querySelectorAll('.attacker');
console.log('[NO DEF]', attackerCells);

document.querySelectorAll('.cell').forEach(cell => {
    cell.addEventListener('click', () => {
        // проверяем, можно ли выбирать фигуру в зависимости от текущего игрока
        if ((walkingPlayer === 'attacker' && cell.classList.contains('defender')) ||
            (walkingPlayer === 'defender' && cell.classList.contains('attacker'))) {
            console.log('Сейчас ход другого игрока');
            return;
        }
        // определение типа фигуры на клетке
        const pieceType = cell.classList.contains('attacker') ? 'attacker' : (cell.classList.contains('defender') ? 'defender' : 'empty');
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
            // 


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

                if (pieceType === 'attacker') {
                    // удаляются классы defender и attacker
                    selectedCell.classList.remove('defender')
                    selectedCell.classList.remove('attacker')

                    // пометить начальную клетку как пустую
                    selectedCell.classList.add('empty');
                }
                else {
                    selectedCell.classList.remove('defender')
                    selectedCell.classList.remove('attacker')

                    selectedCell.classList.add('empty');

                }
                // selectedCell.classList.add('empty');
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

