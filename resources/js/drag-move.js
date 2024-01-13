const onDragStart = (event) => {
    console.log("dragstartイベントが発生した");

    event.dataTransfer.setData("text/plain", event.target.id);
    // event.dataTransfer.dropEffect = "move";
};

const onDrop = (event) => {
    console.log("dropイベントが発生した");
    event.currentTarget.after(
        document.getElementById(event.dataTransfer.getData("text"))
    );
};

const onDragEnter = (event) => {
    event.preventDefault();
};

const onDragOver = (event) => {
    event.preventDefault();
};

document.querySelectorAll(".drag-target").forEach((element) => {
    element.addEventListener("dragstart", onDragStart);
    element.addEventListener("drop", onDrop);
    element.addEventListener("dragenter", onDragEnter);
    element.addEventListener("dragover", onDragOver);
});
