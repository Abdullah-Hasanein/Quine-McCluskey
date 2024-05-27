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
    const primeImplicants = getPrimeImplicants(uniqueMergedMinterms);

    // Step 5: Constructing prime implicant table
    const primeImplicantTable = constructPrimeImplicantTable(primeImplicants, minterms);
    displayPrimeImplicantTable(primeImplicantTable, primeImplicants, minterms);

    // Step 6: Identifying essential prime implicants
    const essentialPrimeImplicants = identifyEssentialPrimeImplicants(primeImplicantTable, primeImplicants, minterms);
    displayEssentialPrimeImplicants(essentialPrimeImplicants);

    // Step 7: Possible function minimizations
    displayPossibleMinimizations(essentialPrimeImplicants);
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
                        merged = true;
                    }
                });
            });
            groupIndex++;
        }
    }

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

function getPrimeImplicants(uniqueMergedMinterms) {
    const primeImplicants = [];

    Object.keys(uniqueMergedMinterms).forEach(group => {
        uniqueMergedMinterms[group].forEach(mintermObj => {
            primeImplicants.push(mintermObj);
        });
    });

    const primeImplicantsList = document.getElementById('prime-implicants-list');
    primeImplicantsList.innerHTML = '';

    primeImplicants.forEach(implicant => {
        const listItem = document.createElement('li');
        listItem.textContent = convertToVariables(implicant.binary);
        primeImplicantsList.appendChild(listItem);
    });

    return primeImplicants;
}

function convertToVariables(binary) {
    const variables = ['W', 'X', 'Y', 'Z'];
    let result = '';

    binary.split('').forEach((bit, index) => {
        if (bit === '1') result += variables[index];
        if (bit === '0') result += `${variables[index]}'`;
    });

    return result;
}

function constructPrimeImplicantTable(primeImplicants, minterms) {
    const table = {};

    primeImplicants.forEach(primeImplicant => {
        primeImplicant.minterms.forEach(minterm => {
            if (!table[minterm]) {
                table[minterm] = [];
            }
            table[minterm].push(primeImplicant.binary);
        });
    });

    return table;
}

function displayPrimeImplicantTable(primeImplicantTable, primeImplicants, minterms) {
    const tableHead = document.getElementById('prime-implicant-table').querySelector('thead');
    const tableBody = document.getElementById('prime-implicant-table').querySelector('tbody');

    const headerRow = document.createElement('tr');
    const primeImplicantHeaderCell = document.createElement('th');
    primeImplicantHeaderCell.textContent = 'Prime Implicant';
    headerRow.appendChild(primeImplicantHeaderCell);

    minterms.forEach(minterm => {
        const cell = document.createElement('th');
        cell.textContent = minterm;
        headerRow.appendChild(cell);
    });

    tableHead.innerHTML = '';
    tableHead.appendChild(headerRow);
    tableBody.innerHTML = '';

    primeImplicants.forEach(primeImplicant => {
        const row = document.createElement('tr');
        const implicantCell = document.createElement('td');
        implicantCell.textContent = convertToVariables(primeImplicant.binary);
        row.appendChild(implicantCell);

        minterms.forEach(minterm => {
            const cell = document.createElement('td');
            cell.textContent = primeImplicantTable[minterm] && primeImplicantTable[minterm].includes(primeImplicant.binary) ? 'X' : '';
            row.appendChild(cell);
        });

        tableBody.appendChild(row);
    });

    document.getElementById('prime-implicants').classList.remove('hidden');
}

function identifyEssentialPrimeImplicants(primeImplicantTable, primeImplicants, minterms) {
    const essentialPrimeImplicants = [];

    minterms.forEach(minterm => {
        const coveringImplicants = primeImplicantTable[minterm];
        if (coveringImplicants && coveringImplicants.length === 1) {
            const essentialImplicant = coveringImplicants[0];
            if (!essentialPrimeImplicants.includes(essentialImplicant)) {
                essentialPrimeImplicants.push(essentialImplicant);
            }
        }
    });

    return essentialPrimeImplicants;
}

function displayEssentialPrimeImplicants(essentialPrimeImplicants) {
    const essentialList = document.getElementById('essential-prime-implicants-list');
    essentialList.innerHTML = '';

    essentialPrimeImplicants.forEach(implicant => {
        const listItem = document.createElement('li');
        listItem.textContent = convertToVariables(implicant);
        essentialList.appendChild(listItem);
    });

    document.getElementById('essential-prime-implicants').classList.remove('hidden');
}

function displayPossibleMinimizations(essentialPrimeImplicants) {
    const resultDiv = document.createElement('div');
    const resultHeader = document.createElement('h2');
    resultHeader.textContent = 'Possible Function Minimizations';
    const resultList = document.createElement('ul');

    const listItem = document.createElement('li');
    listItem.textContent = `F = ${essentialPrimeImplicants.map(convertToVariables).join(' + ')}`;
    resultList.appendChild(listItem);

    resultDiv.appendChild(resultHeader);
    resultDiv.appendChild(resultList);
    document.querySelector('.container').appendChild(resultDiv);
}
