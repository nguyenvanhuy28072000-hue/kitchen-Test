let currentDishes = [];
firebase.auth().onAuthStateChanged(user => {

    if (!user) {
        alert("ログインしてください");
        location.href = "login.html";
        return;
    }

    loadCourses();

});

//-----------------------
// コース一覧取得
//-----------------------

function loadCourses(){

    window.db.collection("courses")
    .get()
    .then(snapshot=>{
        const select =
        document.getElementById("courseSelect");
        select.innerHTML="";
        snapshot.forEach(doc=>{
            select.innerHTML += `
            <option value="${doc.id}">
                ${doc.id}
            </option>
            `;
        });
        if(snapshot.size>0){
            loadCourse();
        }

    })
    .catch(error=>{
        alert(error.message);
    });
}

document
.getElementById("courseSelect")
.addEventListener("change",loadCourse);

//-----------------------
// コース読込
//-----------------------

function loadCourse(){

    const id =
    document.getElementById("courseSelect").value;

    if(id=="") return;

    window.db.collection("courses")
    .doc(id)
    .get()
    .then(doc=>{

        const data = doc.data();

        document.getElementById("duration").value =
        data.duration;

        // Firestoreの料理を配列へコピー
        currentDishes = [...(data.dishes || [])];

        // 一覧表示
        renderDishList();

    });

}

//-----------------------
// 保存
//-----------------------

function saveCourse(){

    const id =
    document.getElementById("courseSelect").value;

    const duration =
    Number(document.getElementById("duration").value);

    window.db.collection("courses")
    .doc(id)
    .update({

        duration: duration,

        dishes: currentDishes

    })
    .then(()=>{

        alert("保存しました");

    });

}

//-----------------------
// コース追加
//-----------------------

function addCourse(){

    const name=
    prompt("新しいコース名");

    if(!name) return;

    window.db.collection("courses")
    .doc(name)
    .set({
        duration:90,
        dishes:[],
        order:Date.now()
    })
    .then(()=>{

        alert("追加しました");

        loadCourses();

    });

}

//-----------------------
// コース削除
//-----------------------

function deleteCourse(){

    const id=
    document.getElementById("courseSelect").value;

    if(!confirm(id+"を削除しますか？")) return;

    window.db.collection("courses")
    .doc(id)
    .delete()
    .then(()=>{

        alert("削除しました");

        loadCourses();

    });

}

//-----------------------
// コース名変更
//-----------------------

function renameCourse(){

    const oldName=
    document.getElementById("courseSelect").value;

    const newName=
    prompt("新しいコース名");

    if(!newName) return;

    window.db.collection("courses")
    .doc(oldName)
    .get()
    .then(doc=>{

        return window.db
        .collection("courses")
        .doc(newName)
        .set(doc.data());

    })
    .then(()=>{

        return window.db
        .collection("courses")
        .doc(oldName)
        .delete();

    })
    .then(()=>{

        alert("変更しました");

        loadCourses();

    });

}

function renderDishList(){

    const list =
    document.getElementById("dishList");

    list.innerHTML = "";

    currentDishes.forEach((dish,index)=>{

        list.innerHTML += `
        <div
            draggable="true"
            ondragstart="dragStart(${index})"
            ondragover="event.preventDefault()"
            ondrop="dropDish(${index})">
            
            <input
                type="text"
                value="${dish}"
                onchange="changeDish(${index},this.value)">

            <button
                type="button"
                onclick="deleteDish(${index})">

                削除

            </button>

        </div>
        `;

    });

}

function changeDish(index,value){

    currentDishes[index] = value;

}

function addDish(){

    currentDishes.push("新しい料理");

    renderDishList();

}

function deleteDish(index){

    currentDishes.splice(index,1);

    renderDishList();

}

let dragIndex = null;

function dragStart(index){

    dragIndex = index;

}

function dropDish(dropIndex){

    if(dragIndex===null) return;

    const item =
    currentDishes.splice(dragIndex,1)[0];

    currentDishes.splice(dropIndex,0,item);

    dragIndex = null;

    renderDishList();

}

window.dragStart = dragStart;
window.dropDish = dropDish;

window.addDish = addDish;
window.deleteDish = deleteDish;
window.changeDish = changeDish;