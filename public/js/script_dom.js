const actionBtn = document.querySelector(".suggestedActions");
const menu = document.querySelector("ul");
const title = document.querySelector(".title");
const convBtn = document.querySelector("ul>li:last-child");

let shown = false;

actionBtn.addEventListener("click",()=>{
    !shown ? setTimeout(()=>menu.style.left="30px",200) : setTimeout(()=>menu.style.left="-100%",200);
    shown = !shown;
});

function mouseMove(e){
    const X_PosPerc = e.pageX/window.innerWidth;
    const Y_PosPerc = e.pageY/window.innerHeight;
        let X_1 = -0.5+1.5*X_PosPerc;
        let X_2 = -0.9+2.7*X_PosPerc;
        let X_3 = -1.3+3.9*X_PosPerc;
        let X_4 = -1.7+5.1*X_PosPerc;
        let Y_1 = 0.45*Y_PosPerc;
        let Y_2 = 1.35*Y_PosPerc;
        let Y_3 = 2.25*Y_PosPerc;
        let Y_4 = 3.15*Y_PosPerc;
    
        
    title.style.textShadow=`${X_1}rem ${Y_1}rem 0.1rem rgba(255,255,255,0.75),${X_2}rem ${Y_2}rem 0.1rem rgba(255,255,255,0.55),${X_3}rem ${Y_3}rem 0.1rem rgba(255,255,255,0.35),${X_4}rem ${Y_4}rem 0.1rem rgba(255,255,255,0.15)`;
}

function showTextShadow(){

    document.querySelector("body").addEventListener("mousemove",mouseMove);

}

title.addEventListener("mouseover",showTextShadow);


title.addEventListener("mouseout",function(){
    // this.removeEventListener("mousemove",mouseMove);
    this.removeEventListener("mouseover",showTextShadow);
});

convBtn.addEventListener("click",()=>{
    document.querySelector(".modal_overlay").classList.add("shown");
    document.querySelector(".modal_content").classList.add("shown");
});

document.querySelector(".modal_content>i").addEventListener("click",()=>{
    document.querySelector(".modal_overlay").classList.remove("shown");
    document.querySelector(".modal_content").classList.remove("shown");    
})
