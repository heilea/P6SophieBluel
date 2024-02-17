const form = document.getElementById("login-form")
const connexionAlert = document.getElementById("connexionAlert")

form.addEventListener("submit",function (e) {
    //Empeche le comportement par defaut du formulaire
    e.preventDefault();
})
const connexion = async() => {
    let email = document.getElementById("email").value; 
    let password = document.getElementById("password").value; 

    const url = "http://localhost:5678/api/users/login";
    const data = {email:email,password:password};
    console.log("les data sont", data)
    try{
        const response = await fetch(url,{
            method:"POST",
            headers:{
                "Content-Type":"application/json", //Definition du type de contenu envoye comme JSON
                "Accept":"application/json"
            },
            body:JSON.stringify(data) //Conversion des donnees a envoyer en une chaine JSON

        });
        console.log("la reponse est", response)
         //Si la communication est impossible
        if(!response.ok){
            //On affiche le message d'erreur 
            connexionAlert.style.visibility="visible";
            connexionAlert.style.backgroundColor="rgba(200,0,0,1)";
            connexionAlert.textContent= "Erreur: informations incorrectes";

            //Disparition du message d'erreur en 3 secondes
            setTimeout(function(){
                connexionAlert.style.visibility="hidden";
            },5000) 
            throw new Error(`erreur HTTP: ${response.status}`)
        }
        //Lorsque la connexion est etablie:
        const responseData = await response.json();
        //Recuperation du token provenant de la reponse
        const token = responseData.token;
        //On stocke ce token dans le localStorage
        localStorage.setItem("Token",token);
        //Redirection vers la page principale
        window.location.href="index.html";
    } catch(error){
        console.error("erreur lors de la connexion : ",error)
    }

}
