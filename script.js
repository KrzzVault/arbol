// Variables configurables para el número de hijos
const maxRootChildren = 6; // Máximo número de hijos que puede tener el nodo raíz
const maxOtherNodeChildren = 4; // Máximo número de hijos que pueden tener los demás nodos

// Clase Node que representa un nodo en el árbol n-ario
class Node {
    constructor(data) {
        this.data = data; // Valor almacenado en el nodo
        this.children = []; // Lista de hijos (subárboles)
    }
}

// Clase NaryTree que representa el árbol n-ario
class NaryTree {
    constructor() {
        this.root = null; // El árbol empieza vacío, sin un nodo raíz
    }

    // Método para insertar un nodo en el árbol
    insertNode(value) {
        const newNode = new Node(value); // Crear un nuevo nodo con el valor dado

        // Si el árbol está vacío, el nuevo nodo será la raíz
        if (this.root === null) {
            this.root = newNode;
            return;
        }

        // Utilizamos una cola (queue) para recorrer el árbol de manera nivel por nivel (BFS)
        const queue = [this.root];
        while (queue.length > 0) {
            const current = queue.shift(); // Tomamos el primer nodo de la cola

            // Ordenamos los hijos antes de insertar para mantener el orden ascendente
            current.children.sort((a, b) => a.data - b.data);

            // Determinamos el número máximo de hijos en función del nodo (raíz o no)
            const maxChildren = current === this.root ? maxRootChildren : getRandomChildrenCount(maxOtherNodeChildren);

            // Si el nodo actual tiene espacio para más hijos, insertamos el nuevo nodo
            if (current.children.length < maxChildren) {
                current.children.push(newNode);
                // Ordenamos nuevamente después de la inserción
                current.children.sort((a, b) => a.data - b.data);
                return;
            } else {
                // Si el nodo ya tiene el máximo de hijos, agregamos sus hijos a la cola para continuar el recorrido
                queue.push(...current.children);
            }
        }
    }

    // Recorrido inorden del árbol
    inorder(node, arr = []) {
        if (node !== null) {
            // Primero recorremos todos los hijos del nodo de forma recursiva
            node.children.forEach(child => this.inorder(child, arr));
            // Después agregamos el valor del nodo actual
            arr.push(node.data);
        }
        return arr;
    }

    // Recorrido preorden del árbol
    preorder(node, arr = []) {
        if (node !== null) {
            // Primero agregamos el valor del nodo actual
            arr.push(node.data);
            // Después recorremos sus hijos de forma recursiva
            node.children.forEach(child => this.preorder(child, arr));
        }
        return arr;
    }

    // Recorrido postorden del árbol
    postorder(node, arr = []) {
        if (node !== null) {
            // Primero recorremos todos los hijos del nodo de forma recursiva
            node.children.forEach(child => this.postorder(child, arr));
            // Después agregamos el valor del nodo actual
            arr.push(node.data);
        }
        return arr;
    }

    // Recorrido nivel por nivel del árbol
    levelOrder(node, arr = []) {
        if (!node) return arr;
        const queue = [node]; // Usamos una cola para el recorrido BFS
        while (queue.length > 0) {
            const current = queue.shift(); // Sacamos el primer nodo de la cola
            arr.push(current.data); // Agregamos su valor al array de resultado
            // Añadimos todos sus hijos a la cola
            queue.push(...current.children);
        }
        return arr;
    }

    // Método para reiniciar el árbol (elimina la raíz y todos los nodos)
    resetTree() {
        this.root = null; // Pone la raíz en null, eliminando el árbol
    }

    // Función para eliminar un nodo específico y sus hijos
    deleteNode(value) {
        if (this.root === null) return null; // Si el árbol está vacío, no hay nada que eliminar

        // Si el nodo a eliminar es la raíz
        if (this.root.data === value) {
            this.root = null; // Eliminamos toda la estructura del árbol
            return true;
        }

        // Usamos una cola para recorrer el árbol nivel por nivel
        const queue = [this.root];
        while (queue.length > 0) {
            const current = queue.shift(); // Sacamos el primer nodo de la cola
            // Recorremos los hijos del nodo actual
            for (let i = 0; i < current.children.length; i++) {
                // Si encontramos el nodo a eliminar
                if (current.children[i].data === value) {
                    current.children.splice(i, 1); // Eliminamos el nodo y sus subárboles (hijos)
                    return true; // Retornamos true para indicar que el nodo fue eliminado
                }
                queue.push(current.children[i]); // Agregamos el hijo a la cola para seguir recorriendo
            }
        }

        return false; // Nodo no encontrado
    }
}

// Crear la instancia del árbol
const tree = new NaryTree();

// Event listeners para los botones
document.getElementById('insertNodeButton').addEventListener('click', () => {
    const value = parseInt(prompt("Ingrese un valor para el nodo:"));
    if (!isNaN(value)) {
        tree.insertNode(value); // Inserta un nodo con el valor dado
        document.getElementById('result').textContent = `Nodo ${value} insertado.`;
        renderTreeD3(tree.root); // Renderiza el árbol después de la inserción
    } else {
        document.getElementById('result').textContent = 'Ingrese un valor válido.';
    }
});

document.getElementById('showInorderButton').addEventListener('click', () => {
    const result = tree.inorder(tree.root).join(' '); // Realiza el recorrido inorden
    document.getElementById('result').textContent = `Inorden: ${result}`;
});

document.getElementById('showPreorderButton').addEventListener('click', () => {
    const result = tree.preorder(tree.root).join(' '); // Realiza el recorrido preorden
    document.getElementById('result').textContent = `Preorden: ${result}`;
});

document.getElementById('showPostorderButton').addEventListener('click', () => {
    const result = tree.postorder(tree.root).join(' '); // Realiza el recorrido postorden
    document.getElementById('result').textContent = `Postorden: ${result}`;
});

document.getElementById('showLevelOrderButton').addEventListener('click', () => {
    const result = tree.levelOrder(tree.root).join(' '); // Realiza el recorrido por niveles
    document.getElementById('result').textContent = `Nivel por Nivel: ${result}`;
});

document.getElementById('resetTreeButton').addEventListener('click', () => {
    tree.resetTree(); // Reinicia el árbol
    document.getElementById('result').textContent = 'El árbol ha sido reiniciado.';
    d3.select("#treeContainer").html(""); // Limpiar la renderización del árbol
});

document.getElementById('renderTreeButton').addEventListener('click', () => {
    renderTreeD3(tree.root); // Renderiza el árbol en el contenedor con D3.js
});

// Función para renderizar el árbol utilizando D3.js
function renderTreeD3(root) {
    const treeData = buildTreeData(root); // Construye los datos del árbol en formato adecuado

    const width = document.getElementById('treeContainer').clientWidth;
    const height = document.getElementById('treeContainer').clientHeight;

    const svg = d3.select("#treeContainer").html("") // Limpiar el contenido anterior
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
        .attr("r", 20);

    node.append("text")
        .attr("dy", ".35em")
        .style("text-anchor", "middle")
        .text(d => d.data.name);
}

// Construir datos del árbol para D3.js
function buildTreeData(node) {
    if (!node) return null; // Si el nodo es null, no hay datos
    return {
        name: node.data, // El valor del nodo
        children: node.children.map(child => buildTreeData(child)) // Convertir los hijos recursivamente
    };
}

// Función para generar números aleatorios únicos
function generateUniqueRandomNumbers(count, min, max) {
    const numbers = new Set();
    while (numbers.size < count) {
        const num = Math.floor(Math.random() * (max - min + 1)) + min;
        numbers.add(num); // Usamos un Set para evitar duplicados
    }
    return Array.from(numbers); // Convertimos el Set a array
}

// Event listener para cargar nodos aleatorios
document.getElementById('loadRandomNodesButton').addEventListener('click', () => {
    tree.resetTree(); // Reiniciar el árbol antes de insertar nuevos nodos
    const randomNumbers = generateUniqueRandomNumbers(15, 1, 99); // Generar 15 números aleatorios
    randomNumbers.forEach(num => tree.insertNode(num)); // Insertar cada número como un nodo en el árbol
    document.getElementById('result').textContent = `15 nodos aleatorios insertados: ${randomNumbers.join(', ')}`;
    renderTreeD3(tree.root); // Renderizar el árbol después de insertar los nodos
});

// Función para eliminar un nodo
document.getElementById('deleteNodeButton').addEventListener('click', () => {
    const value = parseInt(prompt("Ingrese el valor del nodo a eliminar:"));
    if (!isNaN(value)) {
        const result = tree.deleteNode(value); // Intentar eliminar el nodo
        if (result) {
            document.getElementById('result').textContent = `Nodo ${value} eliminado.`;
            renderTreeD3(tree.root); // Renderizar el árbol actualizado
        } else {
            document.getElementById('result').textContent = `Nodo ${value} no encontrado.`;
        }
    } else {
        document.getElementById('result').textContent = 'Ingrese un valor válido.';
    }
});

// Función auxiliar para determinar el número de hijos (0 a maxOtherNodeChildren)
function getRandomChildrenCount(maxChildren) {
    return Math.floor(Math.random() * (maxChildren + 1)); // Generar número entre 0 y maxChildren
}
