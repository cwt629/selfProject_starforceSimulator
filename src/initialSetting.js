export default function InitialSetting({ $app, onSubmit, onInput }) {
    this.$target = document.createElement("form");
    this.$target.className = "inputs";
    $app.appendChild(this.$target);
    this.onSubmit = onSubmit;
    this.onInput = onInput;

    this.render = function () {
        this.$target.innerHTML = `
        <h3>시뮬레이션 초기 설정</h3>
        <input name="level" id="levelinput" maxlength="3" placeholder="ex) 150, 160, 200">레벨 장비
        <p>시뮬레이션 시작 및 목표 단계</p>
        <input name="begin" id="begininput" maxlength="2" placeholder="시작">성 >
        <input name="goal" id="goalinput" maxlength="2" placeholder="목표">성
        <p>장비 복구 비용(선택)</p>
        <input name="basicCost" id="costinput" placeholder="파괴 시 추가될 비용">메소
        <input type="submit" class="simulSetting" value="설정">
        <p id="restoreValue">장비 복구 비용이 입력되지 않았습니다.</p>
        `
    }

    // 설정 버튼 누를 때
    this.$target.addEventListener("submit", (e) => {
        e.preventDefault();
        this.onSubmit();
    })

    // 장비 복구 비용 입력 시
    this.$target.addEventListener("input", () => {
        this.onInput();
    })

    // 시작할 때 렌더링 먼저 함
    this.render();
}