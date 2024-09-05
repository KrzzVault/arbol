class Node {
    constructor(data) {
        this.data = data;
        this.left = null;
        this.right = null;
    }
}

class BinaryTree {
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

            if (current.left === null) {
                current.left = newNode;
                return;
            } else {
                queue.push(current.left);
            }

            if (current.right === null) {
                current.right = newNode;
                return;
            } else {
                queue.push(current.right);
            }
        }
    }

    inorder(node, arr = []) {
        if (node !== null) {
            this.inorder(node.left, arr);
            arr.push(node.data);
            this.inorder(node.right, arr);
        }
        return arr;
    }

    preorder(node, arr = []) {
        if (node !== null) {
            arr.push(node.data);
            this.preorder(node.left, arr);
            this.preorder(node.right, arr);
        }
        return arr;
    }

    postorder(node, arr = []) {
        if (node !== null) {
            this.postorder(node.left, arr);
            this.postorder(node.right, arr);
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
            if (current.left) queue.push(current.left);
            if (current.right) queue.push(current.right);
        }
        return arr;
    }

    resetTree() {
        this.root = null;
    }
}

// Crear la instancia del árbol
const tree = new BinaryTree();

// Añadir los event listeners para los botones
document.getElementById('insertNodeButton').addEventListener('click', () => {
    const value = parseInt(prompt("Ingrese un valor para el nodo:"));
    if (!isNaN(value)) {
        tree.insertNode(value);
        document.getElementById('result').textContent = `Nodo ${value} insertado.`;
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
});

document.getElementById('renderTreeButton').addEventListener('click', () => {
    renderTreeD3(tree.root);
});

// Añadir event listener para el botón de búsqueda
document.getElementById('searchNodeButton').addEventListener('click', () => {
    const value = parseInt(prompt("Ingrese el valor del nodo a buscar:"));
    if (!isNaN(value)) {
        const result = searchNode(tree.root, value);
        if (result) {
            document.getElementById('result').textContent = `Nodo ${value} encontrado.`;
        } else {
            document.getElementById('result').textContent = `Nodo ${value} no encontrado.`;
        }
    } else {
        document.getElementById('result').textContent = 'Ingrese un valor válido.';
    }
});

// Función para buscar un nodo en el árbol
function searchNode(node, value) {
    if (!node) return null;
    if (node.data === value) return node;
    return searchNode(node.left, value) || searchNode(node.right, value);
}


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
        children: [buildTreeData(node.left), buildTreeData(node.right)].filter(n => n !== null)
    };
}
