export default function Star({ $app, initialState }) {
    this.state = initialState;
    this.$target = document.createElement("div");
    this.$target.className = "star";
    $app.appendChild(this.$target);

    this.setState = function (nextState) {
        this.state = nextState;
        this.render();
    }

    this.render = function () {
        // 별모양 받기
        const stars = [];
        let i = 0;
        while (i < 25 && i < this.state.currentStar) {
            stars.push("★");
            i++;
        }
        // 나머지
        while (i < 25) {
            stars.push("☆");
            i++;
        }

        // 별모양 반영
        this.$target.innerHTML = `
        <p>
            <span>${stars.slice(0, 5).join("")}</span>
            <span>${stars.slice(5, 10).join("")}</span>
            <span>${stars.slice(10, 15).join("")}</span>
        </p>
        <p>
            <span>${stars.slice(15, 20).join("")}</span>
            <span>${stars.slice(20).join("")}</span>
        </p>
        `

        // 초기 설정 완료 시에만 보여줌
        this.$target.style.display = (this.state.ready) ? 'block' : 'none';
    }
}