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
        // 아직 limit이 설정되지 않은 경우, 아무 것도 그리지 않음
        if (this.state.limit === null) return;

        // 별모양 받기
        const stars = [];
        let i = 0;
        while (i < this.state.limit && i < this.state.currentStar) {
            stars.push("★");
            i++;
        }
        // 나머지
        while (i < this.state.limit) {
            stars.push("☆");
            i++;
        }

        // 별모양으로 element 만들기
        const elements = [];
        for (let i = 0; i < this.state.limit; i += 5) {
            elements.push(`<span>${stars.slice(i, i + 5).join("")}</span>`);
        }

        // 만들어진 element 반영
        this.$target.innerHTML = `<p>${elements.slice(0, 3).join("")}</p>${(this.state.limit > 15) ? `<p>${elements.slice(3).join("")}</p>` : ''}`;

        // 초기 설정 완료 시에만 보여줌
        this.$target.style.display = (this.state.ready) ? 'block' : 'none';
    }
}