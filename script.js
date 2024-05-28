document.getElementById('minterm-form').addEventListener('submit', function (event) {
    event.preventDefault();

    const mintermsInput = document.getElementById('minterms').value;
    const minterms = mintermsInput.split(',').map(Number);

    if (!validateInput(minterms)) {
        alert('Please enter valid minterms.');
        return;
    }

    // Step 1: Initial Minterms and Prime Implicants Table
    displayInitialMinterms(minterms);

    // Step 2: Grouping minterms
    const groupedMinterms = groupMinterms(minterms);
    displayGroupedMinterms(groupedMinterms);

    let mergedMinterms = groupedMinterms;
    let iteration = 1;

    // Step 3: Merging minterms
    while (true) {
        const newMergedMinterms = mergeMinterms(mergedMinterms);
        if (Object.keys(newMergedMinterms).length === 0) break;
        displayMergedMinterms(newMergedMinterms, iteration++);
        mergedMinterms = newMergedMinterms;
    }

    // Step 4: Removing redundant minterms
    const uniqueMergedMinterms = removeRedundantMinterms(mergedMinterms);
    displayFinalMergedMinterms(uniqueMergedMinterms);

    // Step 5: Prime Implicant Chart
    const primeImplicantChart = generatePrimeImplicantChart(uniqueMergedMinterms, minterms);
    displayPrimeImplicantChart(primeImplicantChart);

    // Step 6: Extract Essential Prime Implicants
    const essentialPrimeImplicants = extractEssentialPrimeImplicants(primeImplicantChart);
    displayEssentialPrimeImplicants(essentialPrimeImplicants);

    // Step 7: Display Final Expression
    const finalExpression = generateFinalExpression(essentialPrimeImplicants);
    displayFinalExpression(finalExpression);
});

function validateInput(minterms) {
    return minterms.every(minterm => Number.isInteger(minterm) && minterm >= 0);
}

function displayInitialMinterms(minterms) {
    const initialTableBody = document.getElementById('initial-minterms-table').querySelector('tbody');
    initialTableBody.innerHTML = '';
    const row = document.createElement('tr');
    const initialCell = document.createElement('td');
    initialCell.colSpan = minterms.length;
    initialCell.textContent = `F(W, X, Y, Z) = Σm(${minterms.join(', ')})`;
    row.appendChild(initialCell);
    initialTableBody.appendChild(row);
    document.getElementById('initial-minterms').classList.remove('hidden');
}

function groupMinterms(minterms) {
    const groups = {};

    minterms.forEach(minterm => {
        const binary = minterm.toString(2).padStart(4, '0');
        const onesCount = binary.split('1').length - 1;

        if (!groups[onesCount]) {
            groups[onesCount] = [];
        }
        groups[onesCount].push({
            minterms: [minterm],
            binary: binary
        });
    });

    return groups;
}

function mergeMinterms(groups) {
    const mergedGroups = {};
    let merged = false;
    let groupIndex = 1;

    const groupKeys = Object.keys(groups).map(Number).sort((a, b) => a - b);
    const checkedBinaries = new Set();

    for (let i = 0; i < groupKeys.length - 1; i++) {
        const currentGroup = groups[groupKeys[i]];
        const nextGroup = groups[groupKeys[i + 1]];

        if (currentGroup && nextGroup) {
            currentGroup.forEach(item1 => {
                nextGroup.forEach(item2 => {
                    const diff = getBitDifference(item1.binary, item2.binary);
                    if (diff === 1) {
                        const mergedBinary = mergeBinary(item1.binary, item2.binary);
                        const mergedMinterms = [...new Set([...item1.minterms, ...item2.minterms])];

                        if (!mergedGroups[groupIndex]) {
                            mergedGroups[groupIndex] = [];
                        }
                        mergedGroups[groupIndex].push({
                            minterms: mergedMinterms,
                            binary: mergedBinary
                        });
                        checkedBinaries.add(item1.binary);
                        checkedBinaries.add(item2.binary);
                        merged = true;
                    }
                });
            });
            groupIndex++;
        }
    }

    // Include unmerged groups in the next iteration
    Object.keys(groups).forEach(group => {
        groups[group].forEach(mintermObj => {
            if (!checkedBinaries.has(mintermObj.binary)) {
                if (!mergedGroups[groupIndex]) {
                    mergedGroups[groupIndex] = [];
                }
                mergedGroups[groupIndex].push(mintermObj);
            }
        });
    });

    return merged ? mergedGroups : {};
}

function getBitDifference(binary1, binary2) {
    let diffCount = 0;

    for (let i = 0; i < binary1.length; i++) {
        if (binary1[i] !== binary2[i]) {
            diffCount++;
        }
    }

    return diffCount;
}

function mergeBinary(binary1, binary2) {
    let mergedBinary = '';

    for (let i = 0; i < binary1.length; i++) {
        if (binary1[i] === binary2[i]) {
            mergedBinary += binary1[i];
        } else {
            mergedBinary += '-';
        }
    }

    return mergedBinary;
}

function displayGroupedMinterms(groupedMinterms) {
    const tableBody = document.getElementById('grouped-minterms-table').querySelector('tbody');
    tableBody.innerHTML = '';

    Object.keys(groupedMinterms).forEach(group => {
        groupedMinterms[group].forEach((mintermObj, index) => {
            const row = document.createElement('tr');
            if (index === 0) {
                const groupCell = document.createElement('td');
                groupCell.textContent = group;
                groupCell.rowSpan = groupedMinterms[group].length;
                row.appendChild(groupCell);
            }
            const mintermsCell = document.createElement('td');
            mintermsCell.textContent = mintermObj.minterms.join(', ');
            const binaryCells = mintermObj.binary.split('').map(bit => {
                const cell = document.createElement('td');
                cell.textContent = bit;
                return cell;
            });

            row.appendChild(mintermsCell);
            binaryCells.forEach(cell => row.appendChild(cell));
            tableBody.appendChild(row);
        });
    });

    document.getElementById('grouped-result').classList.remove('hidden');
}

function displayMergedMinterms(mergedMinterms, iteration) {
    const tableBody = document.getElementById('merged-minterms-table').querySelector('tbody');
    const iterationHeader = document.createElement('tr');
    const iterationCell = document.createElement('th');
    iterationCell.colSpan = 6;
    iterationCell.textContent = `Iteration ${iteration}`;
    iterationHeader.appendChild(iterationCell);
    tableBody.appendChild(iterationHeader);

    Object.keys(mergedMinterms).forEach(group => {
        mergedMinterms[group].forEach((mintermObj, index) => {
            const row = document.createElement('tr');
            if (index === 0) {
                const groupCell = document.createElement('td');
                groupCell.textContent = group;
                groupCell.rowSpan = mergedMinterms[group].length;
                row.appendChild(groupCell);
            }
            const mintermsCell = document.createElement('td');
            mintermsCell.textContent = mintermObj.minterms.join(', ');
            const binaryCells = mintermObj.binary.split('').map(bit => {
                const cell = document.createElement('td');
                cell.textContent = bit;
                return cell;
            });

            row.appendChild(mintermsCell);
            binaryCells.forEach(cell => row.appendChild(cell));
            tableBody.appendChild(row);
        });
    });

    document.getElementById('merged-result').classList.remove('hidden');
}

function removeRedundantMinterms(groups) {
    const uniqueGroups = {};
    const checkedBinaries = new Set();

    Object.keys(groups).forEach(group => {
        groups[group].forEach(mintermObj => {
            if (!checkedBinaries.has(mintermObj.binary)) {
                if (!uniqueGroups[group]) {
                    uniqueGroups[group] = [];
                }
                uniqueGroups[group].push(mintermObj);
                checkedBinaries.add(mintermObj.binary);
            }
        });
    });

    return uniqueGroups;
}

function displayFinalMergedMinterms(uniqueMergedMinterms) {
    const tableBody = document.getElementById('final-merged-minterms-table').querySelector('tbody');
    tableBody.innerHTML = '';

    Object.keys(uniqueMergedMinterms).forEach(group => {
        uniqueMergedMinterms[group].forEach((mintermObj, index) => {
            const row = document.createElement('tr');
            if (index === 0) {
                const groupCell = document.createElement('td');
                groupCell.textContent = group;
                groupCell.rowSpan = uniqueMergedMinterms[group].length;
                row.appendChild(groupCell);
            }
            const mintermsCell = document.createElement('td');
            mintermsCell.textContent = mintermObj.minterms.join(', ');
            const binaryCells = mintermObj.binary.split('').map(bit => {
                const cell = document.createElement('td');
                cell.textContent = bit;
                return cell;
            });

            row.appendChild(mintermsCell);
            binaryCells.forEach(cell => row.appendChild(cell));
            tableBody.appendChild(row);
        });
    });

    document.getElementById('final-result').classList.remove('hidden');
}

function generatePrimeImplicantChart(uniqueMergedMinterms, minterms) {
    const inputMinterms = document.getElementById('minterms').value.split(',').map(Number);
    const maxMinterm = Math.max(...inputMinterms);
    const headerRow = document.createElement('tr');
    const header = document.createElement('th');
    header.textContent = 'PIs/Minterms';
    headerRow.appendChild(header);

    for (let i = 0; i <= maxMinterm; i++) {
        if (inputMinterms.includes(i)) {
            const mintermHeader = document.createElement('th');
            mintermHeader.textContent = i;
            headerRow.appendChild(mintermHeader);
        }
    }

    const primeImplicantChartTable = document.getElementById('prime-implicant-chart-table');
    const thead = primeImplicantChartTable.querySelector('thead');
    thead.innerHTML = '';
    thead.appendChild(headerRow);

    const primeImplicantChart = [];

    Object.keys(uniqueMergedMinterms).forEach(group => {
        uniqueMergedMinterms[group].forEach(mintermObj => {
            const row = {
                minterms: mintermObj.minterms.join(', '),
                binary: mintermObj.binary,
                chart: {}
            };
            minterms.forEach(minterm => {
                row.chart[minterm] = mintermObj.minterms.includes(minterm) ? 'X' : '';
            });
            primeImplicantChart.push(row);
        });
    });

    return primeImplicantChart;
}

function displayPrimeImplicantChart(primeImplicantChart) {
    const tableBody = document.getElementById('prime-implicant-chart-table').querySelector('tbody');
    tableBody.innerHTML = '';

    primeImplicantChart.forEach(row => {
        const tr = document.createElement('tr');
        const mintermsCell = document.createElement('td');
        mintermsCell.textContent = row.minterms;
        tr.appendChild(mintermsCell);

        Object.keys(row.chart).forEach(minterm => {
            const cell = document.createElement('td');
            cell.textContent = row.chart[minterm];
            tr.appendChild(cell);
        });

        tableBody.appendChild(tr);
    });

    document.getElementById('prime-implicant-chart').classList.remove('hidden');
}

function extractEssentialPrimeImplicants(primeImplicantChart) {
    const essentialPrimeImplicants = [];
    const mintermsCovered = new Set();
    const mintermColumns = Object.keys(primeImplicantChart[0].chart);

    while (mintermsCovered.size < mintermColumns.length) {
        const essentialRow = findEssentialPrimeImplicant(primeImplicantChart, mintermsCovered);
        if (!essentialRow) break;
        essentialPrimeImplicants.push(essentialRow.binary);
        essentialRow.minterms.split(', ').forEach(minterm => mintermsCovered.add(minterm));

        // Remove covered minterms from the chart
        primeImplicantChart = primeImplicantChart.filter(row => {
            return !essentialRow.minterms.split(', ').every(minterm => row.chart[minterm] === 'X');
        });
    }

    return essentialPrimeImplicants;
}

function findEssentialPrimeImplicant(primeImplicantChart, mintermsCovered) {
    let maxCovered = 0;
    let essentialRow = null;

    primeImplicantChart.forEach(row => {
        const coveredMinterms = Object.keys(row.chart).filter(minterm => row.chart[minterm] === 'X' && !mintermsCovered.has(minterm));
        if (coveredMinterms.length > maxCovered) {
            maxCovered = coveredMinterms.length;
            essentialRow = row;
        }
    });

    return essentialRow;
}

function displayEssentialPrimeImplicants(essentialPrimeImplicants) {
    const tableBody = document.getElementById('essential-prime-implicants-table').querySelector('tbody');
    tableBody.innerHTML = '';

    essentialPrimeImplicants.forEach(binary => {
        const row = document.createElement('tr');
        const cell = document.createElement('td');
        cell.textContent = binary;
        row.appendChild(cell);
        tableBody.appendChild(row);
    });

    document.getElementById('essential-prime-implicants').classList.remove('hidden');
}

function generateFinalExpression(essentialPrimeImplicants) {
    const terms = essentialPrimeImplicants.map(binary => {
        let term = '';
        const variables = ['W', 'X', 'Y', 'Z'];
        binary.split('').forEach((bit, index) => {
            if (bit === '1') {
                term += variables[index];
            } else if (bit === '0') {
                term += variables[index] + "'";
            }
        });
        return term;
    });

    return terms.join(' + ');
}

function displayFinalExpression(expression) {
    const resultDiv = document.getElementById('final-expression');
    resultDiv.textContent = `Minimal Expression: ${expression}`;
    resultDiv.classList.remove('hidden');
}
