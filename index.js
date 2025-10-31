let list = [
  "Aujourd hui le soleil se leve tres tot et les oiseaux commencent a chanter doucement dans le grand jardin derriere la maison ou toute la famille se reunira pour prendre le petit dejeuner ensemble avant de commencer la journee avec beaucoup d energie et de joie pour tous.",
  
  "Je me leve tot le matin pour profiter du silence et de la fraicheur avant que la ville ne devienne bruyante et pleine de voitures et de gens qui courent partout pour aller travailler ou accomplir leurs taches quotidiennes dans le calme de la maison.",
  
  "Les enfants jouent au football dans la cour avec leurs amis pendant que les parents discutent tranquillement assis sur les bancs en bois pres du parc vert ou l on peut admirer les arbres et les fleurs qui poussent doucement chaque jour avec le soleil et la pluie.",
  
  "Nous avons decide de partir en voyage en montagne pour respirer l air pur et admirer les paysages magnifiques des sommets avec les vallees profondes et les ruisseaux qui coulent lentement et pour profiter de moments de detente loin de la ville et de son agitation.",
  
  "Elle prepare un grand repas pour toute la famille avec des legumes frais et des fruits du marche et un gateau maison accompagne de chocolat et de vanille pour que chacun puisse se regaler tout en discutant et en partageant de beaux moments ensemble.",
  
  "Mon frere etudie a l universite depuis plusieurs annees et il veut devenir ingenieur en informatique pour pouvoir creer des applications utiles et interessantes qui aideront les gens dans leur vie quotidienne et dans leur travail professionnel chaque jour.",
  
  "Le soir j aime marcher au bord de la mer et ecouter le bruit des vagues qui se brisent doucement sur le sable humide tout en respirant l air frais et en regardant le ciel qui devient de plus en plus sombre avec les etoiles qui apparaissent.",
  
  "Dans la bibliotheque du quartier on trouve des livres anciens et rares que peu de gens connaissent encore et chaque visite permet de decouvrir des histoires passionnantes et des aventures qui transportent le lecteur dans des mondes differents et pleins d imagination.",
  
  "Le train est arrive en retard a cause de la pluie mais tout le monde est reste calme et patient pendant l attente en regardant autour et en discutant avec des amis ou des inconnus pour passer le temps sans se sentir ennuyes.",
  
  "Chaque ete nous visitons le village de nos grands parents pour passer du temps en famille et raconter de vieilles histoires, jouer avec les enfants et aider dans le jardin ou dans la cuisine pour apprendre de nouvelles choses tout en s amusant ensemble avec joie et bonheur."
];


let dandindex = Math.floor(Math.random() * list.length);
let chalenge = list[dandindex];

let f = [];
for (let i = 0; i < chalenge.length; i++) {
    f.push(`<span>${chalenge[i]}</span>`);
}
document.getElementById("txt").innerHTML = f.join("");
//function time
let  divTime=document.querySelector("#time");
divTime.classList.add('timeBlock');

let time;
let timing=0;
document.querySelector('#scnd').textContent=timing;

let errorNumbers=0;
document.querySelector('#error').textContent=errorNumbers;

let wpm =0;
let devWPM=document.getElementById('wpm');
devWPM.textContent=wpm;

let acc=0;
let devAcc=document.getElementById("acc");
devAcc.textContent=Math.floor(acc)+"%";


function hendelClickP(e){
     
    

     document.querySelector('#scnd').textContent=timing;

     let endTime =setInterval(()=>{
      //  if(cons){
      //     //affech resolt
      //  }
      document.querySelector('#scnd').textContent=timing;
      if(timing==0){
         clearInterval(endTime);
      }
      timing--;
   },1000)

     divTime.classList.remove('timeBlock');
     divTime.classList.add('timeNone');

     time=parseInt(e.lastChild.textContent)*1000;
     timing=time/1000;

     if(time==60){
     document.querySelector("#totatWpm").textContent="/ "+(Math.floor(numberWord));
}else if(time==30){
     document.querySelector("#totatWpm").textContent="/ "+(Math.floor(numberWord))*2;
     
}else{
     document.querySelector("#totatWpm").textContent="/ "+(Math.floor(numberWord))*4;
     
}
}


    
//3adad ar9am mn bach n7sab acc
let numberWord=(chalenge.length)/5;


setTimeout(()=>{
      
},time);

let index = -1;

let spans = document.querySelectorAll('span');
let cmp=0;
window.addEventListener('keydown', (e) => {
       //acc
       if(errorNumbers<=chalenge.length){
            acc=((chalenge.length-errorNumbers)*100)/chalenge.length;
            devAcc.textContent=Math.floor(acc) +"%";

           }else{
            devAcc.textContent=0;
           }
   
       document.querySelector('.typing-game').focus();

       if(e.key =="Shift" || e.key=="ArrowDown" || e.key=="ArrowUp" || e.key=="ArrowLeft" || e.key=="ArrowRight"){
               return;
       }
       else if (e.key === 'Backspace' && index >= 0) {
           spans[index].classList.remove('correct', 'wrong');
           index--;
           cmp=0; 
       }else if( e.key != 'Backspace'){ 
           index++;
           cmp++;
          //ila kan l7arf s7i7
           if (chalenge[index] === e.key) {
               spans[index].classList.add('correct');
                if(cmp==5){
                if(time==60){
                    wpm+=1;
                }else if(time==30){
                    wpm+=1*2;
                }else{
                    wpm+=1*4;
                }
               devWPM.textContent=wpm;
                cmp=0; 
           }
           } else {
               spans[index].classList.add('wrong');
               errorNumbers++;
               document.querySelector('#error').textContent=errorNumbers;
               document.querySelector("#error").classList.add('errors');
                cmp=0; //hna <----------

           }
       }
   });





