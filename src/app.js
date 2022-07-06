import InitialSetting from "./initialSetting.js";
import UpgradeForm from "./upgradeform.js";
import ResultTab from "./resulttab.js";
import CurrentData from "./currentdata.js";
import Star from "./star.js";
import Infos from "./infos.js";
import UpgradeInfo from "./upgradeInfo.js";

export default function App($app) {
    this.state = {
        // 초기 설정 완료 여부
        ready: false,
        // 각 단계별 성공확률
        successPercent: [],
        // 각 단계별 실패(파괴되지 않음)확률
        failurePercent: [],
        // 각 단계별 파괴확률
        destroyPercent: [],
        // 현재 단계의 강화 비용
        cost: null,
        // 강화에 실패해도 유지되는 단계들
        canKeep: [],
        // 강화하는 레벨에서의 최대 강화 단계
        limit: null,
        // 이전 두번에 등급이 하락했는지 여부(찬스타임 구현을 위함)
        fallen: [],
        isChance: false,
        // 시뮬레이션 초기 상태
        init: {
            level: null,
            start: null,
            goal: null,
            equipCost: null
        },
        // 누적 결과
        total: {
            spent: 0n,
            success: 0,
            failure: 0,
            destroyed: 0
        },
        // 현재 강화 단계
        currentStar: null,
        // 파괴방지
        prevention: false,
        // 이번 강화의 결과
        currentResult: null,
        // 목표 달성 여부(이미 달성하고도 더 강화를 시도할 경우 대비)
        achieved: false
    }

    // 초기 설정 컴포넌트 생성
    const initialSetting = new InitialSetting({
        $app,
        onSubmit: () => {
            // 각 입력이 유효한지 확인
            // 레벨
            var lev = document.getElementById("levelinput").value;
            if (lev === "" || isNaN(lev)) {
                alert("레벨을 올바른 숫자로 입력해주세요!");
                return;
            }
            // 레벨은 300을 넘지 않음
            lev = parseInt(lev)
            if (lev > 300 || lev < 0) {
                alert("레벨은 0 - 300 범위만 가능합니다.");
                return;
            }

            // 시작 강화 단계
            var beginInput = document.getElementById("begininput").value;
            if (beginInput === "" || isNaN(beginInput)) {
                alert("시작 강화 단계를 올바른 숫자로 입력해주세요!");
                return;
            }
            // 강화 단계는 현재 레벨의 최고 강화 단계 이상이 될 수 없음
            beginInput = parseInt(beginInput);
            if (beginInput < 0 || beginInput >= getLimit(lev)) {
                alert(`${lev}레벨의 장비 강화 시작 단계는 0 이상 ${getLimit(lev)} 미만이어야 합니다.`);
                return;
            }

            // 목표 강화 단계
            var goalInput = document.getElementById("goalinput").value;
            if (goalInput === "" || isNaN(goalInput)) {
                alert("목표 강화 단계를 올바른 숫자로 입력해주세요!");
                return;
            }
            goalInput = parseInt(goalInput);
            // 목표 단계가 시작 단계 이하인 경우
            if (goalInput <= beginInput) {
                alert("시작 강화 단계보다 목표 단계를 더 크게 설정해야 합니다.");
                return;
            }
            // 목표 단계는 현재 레벨의 최고 강화 단계 이상이 될 수 없음
            if (goalInput <= 0 || goalInput > getLimit(lev)) {
                alert(`${lev}레벨의 장비 목표 강화 단계는 1 이상 ${getLimit(lev)} 이하여야 합니다.`);
                return;
            }

            // 장비 복구 비용
            var equipcost = document.getElementById("costinput").value;
            if (equipcost !== "" && isNaN(equipcost)) {
                alert("장비 복구 비용을 올바른 숫자로 입력해주세요!");
                return;
            }

            // 재설정의 경우
            if (this.state.ready) {
                if (!confirm("재설정 시 현재까지의 모든 강화가 초기화됩니다. 계속하시겠습니까?")) return;
            }

            // 빈 칸으로 둔 경우
            if (equipcost === "") {
                // confirm 받기
                if (!confirm("장비 복구 비용을 비워놓으면, 복구 비용이 고려되지 않으며 파괴 횟수만 고려합니다. \n계속하시겠습니까?"))
                    return;
            }

            // 각 정보들 반영
            this.setState({
                ...this.state,
                ready: true,
                currentStar: beginInput,
                cost: getCost(lev, beginInput),
                fallen: [false, false],
                total: {
                    spent: 0n,
                    success: 0,
                    failure: 0,
                    destroyed: 0
                },
                currentResult: null,
                prevention: false,
                init: {
                    level: lev,
                    start: beginInput,
                    goal: goalInput,
                    equipCost: (equipcost === "") ? null : BigInt(equipcost)
                },
                limit: getLimit(lev),
                achieved: false
            });

            document.querySelector(".simulSetting").value = "재설정";
            document.getElementById("objective").classList.remove("achieved");
        }
    });

    // 결과창 컴포넌트 생성
    const resultTab = new ResultTab({
        $app,
        initialState: {
            ready: this.state.ready,
            currentResult: this.state.currentResult
        }
    });

    // 현재 데이터 컴포넌트 생성
    const currentData = new CurrentData({
        $app,
        initialState: {
            ready: this.state.ready,
            init: this.state.init,
            total: this.state.total,
            achieved: this.state.achieved
        }
    });

    // 별 그림 컴포넌트 생성
    const star = new Star({
        $app,
        initialState: {
            ready: this.state.ready,
            currentStar: this.state.currentStar,
            limit: this.state.limit
        }
    });

    // 강화 정보 컴포넌트 생성
    const infos = new Infos({
        $app,
        initialState: {
            ready: this.state.ready,
            currentStar: this.state.currentStar,
            canKeep: this.state.canKeep,
            cost: this.state.cost,
            successPercent: this.state.successPercent,
            failurePercent: this.state.failurePercent,
            destroyPercent: this.state.destroyPercent,
            fallen: this.state.fallen,
            prevention: this.state.prevention,
            limit: this.state.limit
        }
    });

    // 강화 탭 컴포넌트 생성
    const upgradeForm = new UpgradeForm({
        $app,
        initialState: {
            ready: this.state.ready,
            currentStar: this.state.currentStar,
            fallen: this.state.fallen,
            currentResult: this.state.currentResult,
            limit: this.state.limit
        },
        // 파괴방지 버튼을 누를 시 발생하는 이벤트 함수
        onClick: (box) => {
            // 체크가 되면 강화비용을 2배로
            if (box.checked) {
                infos.setState({
                    ...this.state,
                    prevention: true
                });
                // 체크박스까지 다시 그려지지 않도록 따로 스테이트 설정
                this.state.prevention = true;
            }
            else {
                infos.setState({
                    ...this.state,
                    prevention: false
                });
                this.state.prevention = false;
            }

        },
        // 강화 버튼 누를 시 발생하는 이벤트 함수
        onSubmit: () => {
            // 찬스타임 시에는 무조건 성공
            if (this.state.fallen[0] === true && this.state.fallen[1] === true) {
                this.setState({
                    ...this.state,
                    total: {
                        ...this.state.total,
                        spent: this.state.total.spent + this.state.cost,
                        success: this.state.total.success + 1
                    },
                    fallen: [false, false],
                    cost: getCost(this.state.init.level, this.state.currentStar + 1),
                    currentStar: this.state.currentStar + 1,
                    currentResult: "success"
                });
                return;
            }
            // 스타캐치 해제 및 파괴방지 체크 확인
            const nocatch = document.getElementById("nocatchOption").checked;
            var preventApplied = false;
            // 파괴방지 시 비용 2배 증가
            var preventPenalty = 1n;
            if (this.state.currentStar >= 12 && this.state.currentStar < 17) {
                if (this.state.prevention) {
                    preventPenalty = 2n;
                    preventApplied = true;
                }
            }

            // 강화 결과에 따라 작업 수행
            switch (upgradeResult(this.state.successPercent[this.state.currentStar],
                this.state.destroyPercent[this.state.currentStar],
                nocatch, preventApplied)) {
                case "success":
                    this.setState({
                        ...this.state,
                        total: {
                            ...this.state.total,
                            spent: this.state.total.spent + this.state.cost * preventPenalty,
                            success: this.state.total.success + 1
                        },
                        cost: getCost(this.state.init.level, this.state.currentStar + 1),
                        fallen: [this.state.fallen[1], false],
                        currentStar: this.state.currentStar + 1,
                        currentResult: "success",
                    });

                    // 성공해서 5배수에 올라간 경우(최고 단계인 경우 제외)
                    if (this.state.currentStar % 5 === 0 && this.state.currentStar < this.state.limit
                        && document.getElementById("alertOption").checked) {
                        alert(`${this.state.currentStar}성 달성!`);
                    }
                    break;

                case "failure":
                    var nextstar = this.state.currentStar;
                    // 찬스타임 구현을 위해, 하락과 유지를 구분한다
                    var fell;
                    if (this.state.canKeep.includes(this.state.currentStar)) {
                        fell = false;
                    } else {
                        fell = true;
                        nextstar--;
                    }
                    this.setState({
                        ...this.state,
                        total: {
                            ...this.state.total,
                            spent: this.state.total.spent + this.state.cost * preventPenalty,
                            failure: this.state.total.failure + 1
                        },
                        fallen: [this.state.fallen[1], fell],
                        cost: getCost(this.state.init.level, nextstar),
                        currentStar: nextstar,
                        currentResult: "failure",
                    });
                    break;

                case "destroyed":
                    alert("장비가 파괴되었습니다.");
                    // 장비 복구 비용 반영
                    const additionalCost = (this.state.init.equipCost) ? this.state.init.equipCost : 0n;
                    this.setState({
                        ...this.state,
                        total: {
                            ...this.state.total,
                            spent: this.state.total.spent + this.state.cost + additionalCost,
                            destroyed: this.state.total.destroyed + 1
                        },
                        cost: getCost(this.state.init.level, 12),
                        fallen: [false, false],
                        currentStar: 12,
                        currentResult: "destroyed",
                    });
                    break;
            }
            // 강화 후, 목표에 처음으로 도달한 경우
            if (!this.state.achieved && this.state.currentStar === this.state.init.goal) {
                const achievedMessage = `목표 단계인 ${this.state.init.goal}성에 도달하였습니다!\n총 소비 메소: ${this.state.total.spent.toLocaleString()} 메소${(this.state.total.destroyed > 0 && this.state.init.equipCost === null) ? ` + 해당 아이템 ${this.state.total.destroyed}개` : ''}`;
                alert(achievedMessage);
                if (this.state.currentStar < this.state.limit)
                    alert("목표에는 달성했지만, 이어서 더 강화를 진행할 수 있습니다.");
                this.state.achieved = true;
                document.getElementById("objective").classList.add("achieved");
            }
        }
    });

    // setstate 함수
    this.setState = function (nextState) {
        this.state = nextState;
        resultTab.setState({
            ready: this.state.ready,
            currentResult: this.state.currentResult
        });
        currentData.setState({
            init: this.state.init,
            ready: this.state.ready,
            total: this.state.total,
            achieved: this.state.achieved
        });
        star.setState({
            limit: this.state.limit,
            ready: this.state.ready,
            currentStar: this.state.currentStar
        });
        infos.setState({
            ready: this.state.ready,
            currentStar: this.state.currentStar,
            canKeep: this.state.canKeep,
            cost: getCost(this.state.init.level, this.state.currentStar),
            successPercent: this.state.successPercent,
            failurePercent: this.state.failurePercent,
            destroyPercent: this.state.destroyPercent,
            fallen: this.state.fallen,
            prevention: this.state.prevention,
            limit: this.state.limit
        });
        upgradeForm.setState({
            limit: this.state.limit,
            ready: this.state.ready,
            currentStar: this.state.currentStar,
            fallen: this.state.fallen,
            currentResult: this.state.currentResult,
        });
    }

    // 특정 확률로 강화했을 때 결과를 반환하는 함수(난수 이용)
    const upgradeResult = function (successPercent, destroyPercent, nocatch, prevent) {
        const random = Math.random() * 100;
        // 파괴 방지
        if (prevent) {
            destroyPercent = 0;
        }
        // 스타캐치 시
        if (!nocatch) {
            destroyPercent = destroyPercent * (100 - successPercent * 1.05) / (100 - successPercent);
            successPercent *= 1.05;
        }
        // 성공
        if (random < successPercent) return "success";
        // 파괴
        else if (random > 100 - destroyPercent) return "destroyed";
        // 일반 실패
        return "failure";
    }

    // 특정 레벨과 현재 강화 단계에서의 강화 비용을 반환하는 함수
    const getCost = function (level, star) {
        // 0~9성
        if (star >= 0 && star < 10)
            return BigInt(Math.round((1000 + (level ** 3) * (star + 1) / 25) / 100) * 100);
        // 10~14성
        if (star >= 10 && star < 15)
            return BigInt(Math.round((1000 + (level ** 3) * Math.pow(star + 1, 2.7) / 400) / 100) * 100);
        // 15~24성
        if (star >= 15 && star < 25)
            return BigInt(Math.round((1000 + (level ** 3) * Math.pow(star + 1, 2.7) / 200) / 100) * 100);
    }

    // 특정 레벨의 최대 강화 단계를 반환하는 함수
    const getLimit = function (level) {
        // 95 미만
        if (level < 95)
            return 5;
        // 95~107
        if (level < 108)
            return 8;
        // 108~117
        if (level < 118)
            return 10;
        // 118~127
        if (level < 128)
            return 15;
        // 128~137
        if (level < 138)
            return 20;
        // 138 이상
        return 25;
    }

    // 초기 스테이트 설정
    const upgradeInfo = new UpgradeInfo();
    this.setState({
        ...this.state,
        successPercent: upgradeInfo.success,
        failurePercent: upgradeInfo.failure,
        destroyPercent: upgradeInfo.destroyed,
        canKeep: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20],
        fallen: [false, false]
    });
}