// Variables configurables para el número de hijos
const maxRootChildren = 6; // Máximo de hijos para la raíz
const maxOtherNodeChildren = 4; // Máximo de hijos para los demás nodos

class Node {
    constructor(data) {
        this.data = data;
        this.children = [];
    }
}

class NaryTree {
    constructor() {
        this.root = null;
    }

    insertNode(value) {
        const newNode = new Node(value);
        if (this.root === null) {
            this.root = newNode;
            return;
        }

        const queue = [this.root];
        while (queue.length > 0) {
            const current = queue.shift();

            // Ordenar los hijos antes de intentar la inserción
            current.children.sort((a, b) => a.data - b.data);

            // Determinar el número máximo de hijos basado en el nivel
            const maxChildren = current === this.root ? maxRootChildren : getRandomChildrenCount(maxOtherNodeChildren);

            if (current.children.length < maxChildren) {
                current.children.push(newNode);
                current.children.sort((a, b) => a.data - b.data); // Mantener orden después de la inserción
                return;
            } else {
                // Si el nodo tiene el máximo de hijos, agregamos sus hijos a la cola
                queue.push(...current.children);
            }
        }
    }

    inorder(node, arr = []) {
        if (node !== null) {
            node.children.forEach(child => this.inorder(child, arr));
            arr.push(node.data);
        }
        return arr;
    }

    preorder(node, arr = []) {
        if (node !== null) {
            arr.push(node.data);
            node.children.forEach(child => this.preorder(child, arr));
        }
        return arr;
    }

    postorder(node, arr = []) {
        if (node !== null) {
            node.children.forEach(child => this.postorder(child, arr));
            arr.push(node.data);
        }
        return arr;
    }

    levelOrder(node, arr = []) {
        if (!node) return arr;
        const queue = [node];
        while (queue.length > 0) {
            const current = queue.shift();
            arr.push(current.data);
            queue.push(...current.children);
        }
        return arr;
    }

    resetTree() {
        this.root = null;
    }
}

// Crear la instancia del árbol
const tree = new NaryTree();

// Event listeners para los botones
document.getElementById('insertNodeButton').addEventListener('click', () => {
    const value = parseInt(prompt("Ingrese un valor para el nodo:"));
    if (!isNaN(value)) {
        tree.insertNode(value);
        document.getElementById('result').textContent = `Nodo ${value} insertado.`;
        renderTreeD3(tree.root); // Renderizar el árbol después de la inserción
    } else {
        document.getElementById('result').textContent = 'Ingrese un valor válido.';
    }
});

document.getElementById('showInorderButton').addEventListener('click', () => {
    const result = tree.inorder(tree.root).join(' ');
    document.getElementById('result').textContent = `Inorden: ${result}`;
});

document.getElementById('showPreorderButton').addEventListener('click', () => {
    const result = tree.preorder(tree.root).join(' ');
    document.getElementById('result').textContent = `Preorden: ${result}`;
});

document.getElementById('showPostorderButton').addEventListener('click', () => {
    const result = tree.postorder(tree.root).join(' ');
    document.getElementById('result').textContent = `Postorden: ${result}`;
});

document.getElementById('showLevelOrderButton').addEventListener('click', () => {
    const result = tree.levelOrder(tree.root).join(' ');
    document.getElementById('result').textContent = `Nivel por Nivel: ${result}`;
});

document.getElementById('resetTreeButton').addEventListener('click', () => {
    tree.resetTree();
    document.getElementById('result').textContent = 'El árbol ha sido reiniciado.';
    d3.select("#treeContainer").html(""); // Limpiar la renderización del árbol
});

document.getElementById('renderTreeButton').addEventListener('click', () => {
    renderTreeD3(tree.root);
});

// Función para renderizar el árbol utilizando D3.js
function renderTreeD3(root) {
    const treeData = buildTreeData(root);

    const width = document.getElementById('treeContainer').clientWidth;
    const height = document.getElementById('treeContainer').clientHeight;

    const svg = d3.select("#treeContainer").html("") // Limpiar contenido anterior
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(50,50)");

    const treemap = d3.tree().size([width - 100, height - 100]);

    const nodes = d3.hierarchy(treeData);
    const treeNodes = treemap(nodes);

    const link = svg.selectAll(".link")
        .data(treeNodes.descendants().slice(1))
        .enter().append("path")
        .attr("class", "link")
        .attr("d", d => `
            M${d.x},${d.y}
            L${d.parent.x},${d.parent.y}
        `);

    const node = svg.selectAll(".node")
        .data(treeNodes.descendants())
        .enter().append("g")
        .attr("class", d => "node" + (d.children ? " node--internal" : " node--leaf"))
        .attr("transform", d => `translate(${d.x},${d.y})`);

    node.append("circle")
        .attr("r", 15);

    node.append("text")
        .attr("dy", ".35em")
        .style("text-anchor", "middle")
        .text(d => d.data.name);
}

// Construir datos del árbol para D3.js
function buildTreeData(node) {
    if (!node) return null;
    return {
        name: node.data,
        children: node.children.map(child => buildTreeData(child))
    };
}

// Función para generar números aleatorios únicos
function generateUniqueRandomNumbers(count, min, max) {
    const numbers = new Set();
    while (numbers.size < count) {
        const num = Math.floor(Math.random() * (max - min + 1)) + min;
        numbers.add(num);
    }
    return Array.from(numbers);
}

// Generar un número aleatorio de hijos entre 0 y el máximo permitido
function getRandomChildrenCount(max) {
    return Math.floor(Math.random() * (max + 1));
}

// Añadir el event listener para el botón de cargar nodos aleatorios
document.getElementById('loadRandomNodesButton').addEventListener('click', () => {
    tree.resetTree(); // Reiniciar el árbol antes de insertar los nodos aleatorios
    const randomNumbers = generateUniqueRandomNumbers(15, 1, 99);
    randomNumbers.forEach(num => tree.insertNode(num));
    document.getElementById('result').textContent = `15 nodos aleatorios insertados: ${randomNumbers.join(', ')}`;
    renderTreeD3(tree.root); // Renderizar el árbol después de insertar los nodos
});

// Añadir el event listener para eliminar un nodo
document.getElementById('deleteNodeButton').addEventListener('click', () => {
    const value = parseInt(prompt("Ingrese el valor del nodo a eliminar:"));
    if (!isNaN(value)) {
        const result = deleteNode(tree.root, value);
        if (result) {
            document.getElementById('result').textContent = `Nodo ${value} eliminado.`;
        } else {
            document.getElementById('result').textContent = `Nodo ${value} no encontrado.`;
        }
        renderTreeD3(tree.root); // Renderizar el árbol después de eliminar el nodo
    } else {
        document.getElementById('result').textContent = 'Ingrese un valor válido.';
    }
});

// Función para eliminar un nodo en el árbol
function deleteNode(node, value) {
    if (!node) return null;
    if (node.data === value) {
        node.data = null; // O puedes manejar la eliminación según tu lógica
        return node;
    }
    for (const child of node.children) {
        const result = deleteNode(child, value);
        if (result) return result;
    }
    return null;
}
