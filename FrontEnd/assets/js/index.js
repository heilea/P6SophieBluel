const modifier_button = document.getElementById("modifier"); // boutton modifier
const log = document.getElementById("log"); // boutton login / logout
const gallery = document.querySelector(".gallery")
var connexionAlert = document.getElementById("connexionAlert")
const categoryContainer = document.getElementById('categories'); // container des categories ou filtre des categories
const edition = document.querySelector(".edition"); // afficheur du mode édition

var token = "";
let connected = false; // état de connextion

//Fonction pendant qu'on est connectée:
const connectedFunction = () => {
    token = localStorage.getItem('Token'); // récupération du token dans le localstorage

    // si le token est présent :
    if (token) {
        connected = true;
    }

    if (connected) {
        log.textContent = "logout" // on change le texte du boutton login en logout
        modifier_button.style.visibility = "visible" // on affiche le boutton modifier

        // affichage de l'alerteur de connexion
        connexionAlert.style.visibility = "visible";
        connexionAlert.style.backgroundColor = "rgba(50, 150, 0, 1)";
        connexionAlert.textContent = "Connecté";
        // suppression apres 2 secondes
        setTimeout(function () {
            connexionAlert.style.visibility = "hidden";
            edition.style.visibility = "visible";
        }, 2000);

        // la div de mode édition s'affiche
        edition.style.height = "5.5vh";
        categoryContainer.style.display = "none"

    } else {
        modifier_button.style.visibility = "hidden";
    }

    //Condition de boutton login et logout
    log.addEventListener("click", function () {
        //En cas de clique si connecte
        if (connected) {
            connected = false //Annuler l'etat de connexion
            localStorage.removeItem('Token') //Suppression du token du localStorage
            log.textContent = "login" // On remplace logout par login
            log.href = "index.html";


            connexionAlert.style.visibility = "visible";
            connexionAlert.style.backgroundColor = "rgba(50, 150, 0, 1)";
            connexionAlert.textContent = "Déconnecté";
            // suppression apres 2 secondes
            setTimeout(function () {
                connexionAlert.style.visibility = "hidden";
                edition.style.visibility = "hidden";
            }, 2000);
            //On fait apparaitre les filtres
            categoryContainer.style.display = "flex";

            edition.style.height = "0";
        } else {
            window.location.href = "index.html"
        }
    })
}

connectedFunction();

//On récupère la liste de tous les works
let allWorks = []
const getWorks = async () => {
    try {
        const response = await fetch("http://localhost:5678/api/works");
        const works = await response.json();
        console.log(works)

        //On s'assure d'abord que le tableau est vide
        allWorks.length = 0;
        //On met tous les works récupéré dans le tableau allWorks
        allWorks = works
        console.log("L'ensemble des works est", allWorks)

        for (let work of works) {
            const figure = createWorkFigure(work)
            gallery.appendChild(figure)
        }

    } catch (error) {
        console.error("error fetching works:", error)
        throw new Error(`api error status with status code ${response.status}`)
    }
};
getWorks();

// Fonction pour afficher les travaux en fonction de la catégorie sélectionnée
const filterWorksByCategory = (categoryId) => {
    const gallery = document.querySelector(".gallery");
    gallery.innerHTML = ""; // Effacez le contenu actuel de la galerie

    if (categoryId === 0) {
        // Si la catégorie sélectionnée est "Tous", affichez tous les travaux
        for (let work of allWorks) {
            const figure = createWorkFigure(work);
            gallery.appendChild(figure);
        }
    } else {
        // Sinon, filtrez les travaux par catégorie
        const filteredWorks = allWorks.filter((work) => work.categoryId === categoryId);
        for (let work of filteredWorks) {
            const figure = createWorkFigure(work);
            gallery.appendChild(figure);
        }
    }
};

// Fonction pour créer une balise figure pour un travail donné
const createWorkFigure = (work) => {
    const figure = document.createElement("figure");
    const img = document.createElement("img");
    img.src = work.imageUrl;
    img.alt = work.title;
    figure.appendChild(img);

    const figcaption = document.createElement("figcaption");
    figcaption.textContent = work.title;
    figure.appendChild(figcaption);

    return figure;
};

// On ajoute un gestionnaire d'événements click à chaque bouton de catégorie

const categoriesContainer = document.getElementById("categories");

categoriesContainer.addEventListener("click", (event) => {
    const buttons = document.querySelectorAll(".filters button");
    console.log("les bouttons sont", buttons)
    if (event.target.getAttribute("attribut-category")) {
        // Supprimez la classe active-filter de tous les boutons
        buttons.forEach((button) => {
            button.classList.remove("active-filter");
        });

        console.log(event.target.getAttribute("attribut-category"));
        const categoryId = parseInt(event.target.getAttribute("attribut-category"));

        // Ajoutez la classe active-filter au bouton cliqué
        event.target.classList.add("active-filter");

        filterWorksByCategory(categoryId);
    }
});

/*on créer une fonction /*On récupère la liste de toute les categories */

const getCategory = async () => {
    try {
        const response = await fetch("http://localhost:5678/api/categories");
        const categories = await response.json();
        categories.unshift({
            "id": 0,
            "name": "Tous"
        })
        for (let category of categories) {
            const button = document.createElement('button');
            button.innerHTML = category.name;
            button.setAttribute('attribut-category', category.id);
            categoryContainer.appendChild(button);
        }
    } catch (error) {
        console.error('error fetching categories:', error)
        throw new Error(`api error status with status code ${response.status}`)
    }

}
getCategory();




//Pour la modale

let modifier_interface = document.querySelector(".modifier_interface"); // interface de modification de la gallerie
let gallery_interface = document.querySelector(".gallery_interface");
let add_work = document.querySelector(".add_work");

let arrow_back = document.querySelector(".arrow_back");

let gallery_close = document.querySelector(".gallery_close"); // boutton de fermeture de la gallerie d'édition
let add_work_close = document.querySelector(".add_work_close");

let button_add = document.querySelector(".button_add"); // boutton d'ajout de travaux

let list_works = document.querySelector(".list_works"); // div contenant la liste des travaux éditable dans l'interface de modification
let snaps = []; // les <figure> contenant chaque img de travaux
let trash = []; // logo poubelle dans chaque snaps
let choose_photo = document.querySelector(".choose_photo")
let imgPreview = document.getElementById("imagePreview")

//Pour gérer les évenement click

//Pour ouvrir la modale
modifier_button.addEventListener("click", () => {
    modifier_interface.style.display = "flex";
    gallery_interface.style.display = "flex";
    add_work.style.display = "none";
    modifier();
});

//Pour fermer la gallerie
gallery_close.addEventListener("click", () => {
    modifier_interface.style.display = "none"

})

//Pour fermer en cliquant sur la croix
add_work_close.addEventListener("click", () => {
    modifier_interface.style.display = "none"
})

//Pour ajouter une image sélectionnée
button_add.addEventListener("click", () => {
    gallery_interface.style.display = "none";
    imgPreview.style.display = "none";
    add_work.style.display = "flex";
    choose_photo.style.display = "flex";
    addCategoryOption()
})

// Pour revenir en arrière avec la flèche
arrow_back.addEventListener("click", () => {
    gallery_interface.style.display = "flex";
    add_work.style.display = "none";
    choose_photo.style.display = "flex";
    imgPreview.style.display = "none";

})

//Pour cache la modale quand on clique à l'extérieur
modifier_interface.addEventListener("click", function (event) {
    if (event.target === this) {
        modifier_interface.style.display = "none";
        imgPreview.style.display = "none";
        add_work.style.display = "none";
        gallery_interface.style.display = "none";
    }
})


//Méthode pour afficher les travaux a modifier avec possibilité de les supprimer
const modifier = async () => {
    try {
        const works = await fetch("http://localhost:5678/api/works"); // Récupération des données depuis l'API
        let worksData = await works.json(); // Conversion de la réponse en format JSON

        list_works.innerHTML = "";

        worksData.forEach(dataGroup => { // Parcours de chaque groupe de données

            let img = document.createElement("img"); // Crée un élément <img>
            img.src = dataGroup.imageUrl; // Définit l'attribut 'src' de <img>

            snaps[dataGroup.id] = document.createElement("figure"); // Crée un élément <img> pour chaque projet
            snaps[dataGroup.id].appendChild(img); // Ajoute <img> à <figure>

            trash[dataGroup.id] = document.createElement("i"); // Crée un élément <i> pour chaque projet
            trash[dataGroup.id].classList.add('fa-solid', 'fa-trash-can', 'trash');
            snaps[dataGroup.id].appendChild(trash[dataGroup.id]);

            list_works.appendChild(snaps[dataGroup.id]);

            let urlId = 'http://localhost:5678/api/works/' + dataGroup.id;

            trash[dataGroup.id].addEventListener("click", function () {
                deleteData(urlId);
            })


        });
    } catch (error) {
        console.error('error fetching works:', error)
        throw new Error(`api error status with status code ${response.status}`)
    }
}

//Pour supprimer une image des travaux

const deleteData = async (urlId) => {
    try {
        let response = await fetch(urlId, {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }
    } catch (error) {
        console.error('error deleting work:', error)
        throw new Error(`api error status with status code ${response.status}`)
    }
    //Pour mettre à jour la galerie
    modifier();
    getWorks();


}


// Pour afficher les options des catégories
let options = []
const addCategoryOption = async () => {
    try {
        const selectedElement = document.getElementById("categorie");
        //On créer une option par défaut
        const defaultOption = document.createElement("option");
        defaultOption.textContent = ""
        selectedElement.appendChild(defaultOption)


        const categories = await fetch("http://localhost:5678/api/categories");
        let categoriesData = await categories.json();
        categoriesData.forEach(dataGroup => {
            options[dataGroup.id] = document.createElement("option");
            console.log("l'index est", dataGroup.id)
            options[dataGroup.id].textContent = dataGroup.name;
            selectedElement.appendChild(options[dataGroup.id]);
        });
    } catch (error) {
        console.error('error fetching categories:', error)
    }
}

// Pour ajouter une photo
let urlImg = ""
let add_button = document.querySelector(".add_photo #add_button");
let add_img_input = document.querySelector(".add_photo input");
let titre_select = document.getElementById("titre");
let categorie_select = document.getElementById("categorie");
let add_validate = document.getElementById("add_validate");

// Fonction pour mettre à jour l'état du bouton Valider
const updateValidateButtonState = () => {
    if (titre_select.value !== "" && urlImg !== "" && categorie_select.value !== "") {
        add_validate.style.backgroundColor = "#1D6154";
        add_validate.style.cursor = "pointer";
    } else {
        add_validate.style.backgroundColor = "#A7A7A7";
        add_validate.style.cursor = "not-allowed";
    }
}

// Pour ajouter une image
add_button.addEventListener("click", () => {
    add_img_input.click();
});

add_img_input.addEventListener("change", function (event) {
    var file = event.target.files[0];
    if (file && file.size <= 4 * 1024 * 1024) { // 4MB max
        var reader = new FileReader();
        reader.onload = function (e) {
            imgPreview.src = e.target.result; // Mise à jour de l'aperçu de l'image
            urlImg = e.target.result; // Stockage de l'URL de l'image
            choose_photo.style.display = "none";
            imgPreview.style.display = "block";

            updateValidateButtonState(); // Mise à jour de l'état du bouton ici
        };
        reader.readAsDataURL(file);
        this.value = ""; // Réinitialisation après le chargement
    } else {
        alert("Le fichier est trop volumineux. Veuillez sélectionner un fichier de moins de 4 Mo.");
    }
});

// Gestionnaire pour les changements de titre
titre_select.addEventListener("input", updateValidateButtonState);

// Gestionnaire pour les changements de catégorie
categorie_select.addEventListener("change", updateValidateButtonState);


//Pour transformer l'image en blob (binary large object) afin de faciliter le televersement.
const dataURLtoBlob = (dataurl) => {
    const arr = dataurl.split(','),
        mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]);
    let n = bstr.length,
        u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
};

//Gestionnaire pour la validation de l'ajout d'une image
add_validate.addEventListener("click", () => {
    if (urlImg && titre_select.value != "") {
        var blobImg = dataURLtoBlob(urlImg)
        let formData = new FormData();
        //On s"assure que c'est un objet File ou Blob
        formData.append("image", blobImg)
        formData.append("title", titre_select.value)
        formData.append("category", categorie_select.selectedIndex)
        //

        fetch('http://localhost:5678/api/works', {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Erreur HTTP, statut : ${response.status}`);
                }
                getWorks();
                modifier();
                add_work.style.display = "none";
                modifier_interface.style.display = "none";
                console.log(response.json());
            })//un indicateur ou booléen qui sera à true si on ajoute une photo

            .catch(error => console.error('Erreur lors de la requête fetch:', error));
    }
    else {
        console.log("information manquante");
    }
})


