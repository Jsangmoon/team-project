const detailAside = document.getElementById('detailAside');
const reservedDiv = document.getElementById('reservedDiv');
const swiperWrapper = detailAside.querySelector('[rel="swiperWrapper"]');

const referenceTimeDiv = document.getElementById('referenceTimeDiv');
const referenceTimeDialog = document.getElementById('referenceTimeDialog');

const referenceTimeButton = referenceTimeDiv.querySelector('[rel="referenceTimeButton"]');

let nowDateTime = new Date();

let minutes = nowDateTime.getMinutes();
let fixedMinutes = Math.floor(minutes/10) * 10 + 10;
nowDateTime.setMinutes(fixedMinutes);
nowDateTime.setSeconds(0);

let endDateTime = new Date();

let hours = endDateTime.getHours();
let fixedHours = hours + 1;
endDateTime.setHours(fixedHours);
endDateTime.setMinutes(fixedMinutes);
endDateTime.setSeconds(0);


const showDetailAside = (parkingLotIndex, onclose) => {

    // loadReviews 들어올 자리

    // review 불러오기 위한 parkingLotIndex 찍어줄 자리.

    swiperWrapper.innerHTML = '';

    detailAside.scrollTop = 0;

    detailAside.querySelectorAll('[rel="closer"]').forEach(closer => closer.onclick = () => {
        detailAside.hide();
        if (typeof onclose === 'function') {
            onclose();
        }
    });

    detailAside.querySelector('[name="startDateTime"]').value = dateFormat(nowDateTime);
    detailAside.querySelector('[name="endDateTime"]').value = dateFormat(endDateTime);

    let initialStartDateTime = detailAside.querySelector('[name="startDateTime"]').value;
    let initialEndDateTime = detailAside.querySelector('[name="endDateTime"]').value;

    referenceTimeButton.onclick = () => {
        referenceTimeDialog.querySelector('[name="startDateTime"]').value = '';
        referenceTimeDialog.querySelector('[name="endDateTime"]').value = '';

        cover.show();

        if (sessionStorage.getItem('startDateTime') === null || sessionStorage.getItem('endDateTime') === null) {
        } else {
            initialStartDateTime = detailAside.querySelector('[name="startDateTime"]').value;
            initialEndDateTime = detailAside.querySelector('[name="endDateTime"]').value;
        }

        $(function () {
            $('input[name="datetimes"]').daterangepicker({
                // autoUpdateInput: true,
                locale: {
                    "separator": " ~ ", // 시작일시와 종료일시 구분자
                    "format": 'YYYY-MM-DD HH:mm', // 일시 노출 포맷
                    "applyLabel": "설정하기",  // 확인 버튼 텍스트
                    "cancelLabel": "취소", // 취소 버튼 텍스트
                    "daysOfWeek": ["일", "월", "화", "수", "목", "금", "토"],
                    "monthNames": ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"]
                },
                timePicker: true,
                timePicker24Hour: true,
                timePickerIncrement: 10,
                opens: 'center',
                startDate: initialStartDateTime,
                endDate: initialEndDateTime,
                minDate: nowDateTime,
            });

            $('input[name="datetimes"]').on('apply.daterangepicker', function(ev, picker) {
                sessionStorage.setItem('startDateTime', picker.startDate.format('YYYY-MM-DD HH:mm'));
                sessionStorage.setItem('endDateTime', picker.endDate.format('YYYY-MM-DD HH:mm'));

                referenceTimeDialog.querySelector('[name="startDateTime"]').value = sessionStorage.getItem('startDateTime');
                referenceTimeDialog.querySelector('[name="endDateTime"]').value = sessionStorage.getItem('endDateTime');
            });
        });

        referenceTimeDialog.show();

        referenceTimeDialog.querySelector('[rel="confirmButton"]').onclick = () => {
            detailAside.querySelector('[name="startDateTime"]').value = sessionStorage.getItem('startDateTime');
            detailAside.querySelector('[name="endDateTime"]').value = sessionStorage.getItem('endDateTime');

            referenceTimeDialog.hide();
            cover.hide();
        }

        referenceTimeDialog.querySelector('[rel="cancelButton"]').onclick = () => {
            referenceTimeDialog.hide();
            cover.hide();
        }
    }

    detailAside.querySelector('[rel="reservationButton"]').onclick = () => {
        reservationForm.querySelector('[name="startDateTime"]').value = sessionStorage.getItem('startDateTime');
        reservationForm.querySelector('[name="endDateTime"]').value = sessionStorage.getItem('endDateTime');

        showReservationForm();
    }



    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    xhr.onreadystatechange = function () {
        if (xhr.readyState !== XMLHttpRequest.DONE) {
            return;
        }
        if (xhr.status < 200 || xhr.status >= 300) {
            MessageObj.createSimpleOk('오류', '요청을 전송하는 도중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.', () => location.reload()).show();
            return;
        }
        const parkingLotObject = JSON.parse(xhr.responseText);

        detailAside.querySelector('[rel="name"]').innerText = parkingLotObject['name'];
        detailAside.querySelector('[rel="parkingLotCategoryText"]').innerText = parkingLotObject['parkingLotCategoryText'];
        detailAside.querySelector('[rel="favoriteCount"]').innerText = parkingLotObject['favoriteCount'];
        detailAside.querySelector('[rel="reviewCount"]').innerText = parkingLotObject['reviewCount'];
        detailAside.querySelector('[rel="address"]').innerText = `${parkingLotObject['addressPrimary']} ${parkingLotObject['addressSecondary']}`;
        detailAside.querySelector('[rel="contact"]').href = `tel:${parkingLotObject['contactFirst']} ${parkingLotObject['contactSecond']} ${parkingLotObject['contactThird']}`;
        detailAside.querySelector('[rel="contact"]').innerText = `${parkingLotObject['contactFirst']}-${parkingLotObject['contactSecond']}-${parkingLotObject['contactThird']}`;
        detailAside.querySelector('[rel="generalCarNumber"]').innerText = parkingLotObject['generalCarNumber'];
        detailAside.querySelector('[rel="dpCarNumber"]').innerText = parkingLotObject['dpCarNumber'];
        detailAside.querySelector('[rel="price"]').innerText = parkingLotObject['price'];
        detailAside.querySelector('[rel="dayMaxPrice"]').innerText = parkingLotObject['dayMaxPrice'];
        detailAside.querySelector('[rel="description"]').innerText = parkingLotObject['description'];
        detailAside.querySelector('[rel="contractorName"]').innerText = parkingLotObject['contractorName'];

        if (parkingLotObject['saved'] === true) {
            detailAside.querySelector('[rel="saveButton"]').classList.add('-saved');
        } else {
            detailAside.querySelector('[rel="saveButton"]').classList.remove('-saved');
        }

        const imageContainerEl = detailAside.querySelector('[rel="imageContainer"]');
        const swiperScrollbar = detailAside.querySelector('[rel="swiperScrollbar"]');

        imageContainerEl.querySelectorAll('.image').forEach(image => image.remove());
        for (const imageIndex of parkingLotObject['imageIndexes']) {
            const swiperSlide = document.createElement('div');
            swiperSlide.setAttribute('class', 'swiper-slide');
            const imageEl = document.createElement('img');
            imageEl.setAttribute('alt', '');
            imageEl.setAttribute('class', 'image');
            imageEl.setAttribute('src', `/parkingLot/image?index=${imageIndex}`);
            swiperSlide.append(imageEl);
            swiperWrapper.append(swiperSlide);
        }

        // https://swiperjs.com/swiper-api
        const swiper = new Swiper(imageContainerEl, {
            scrollbar: {
                el: swiperScrollbar,
                hide: true,
            },
            observer: true,
            observeParents: true,
        });

        reservedSpan('144');

        detailAside.show();
    }
    xhr.open('GET', `/parkingLot/?index=${parkingLotIndex}`);
    xhr.send(formData);
}


function reservedSpan(reservedNumber)  {
    const reservedSpans = reservedDiv.querySelectorAll('.reservedSpanEl');

    for (let i = 0; i < reservedSpans.length; i++) {
        if (reservedSpans[i].getAttribute('value') === reservedNumber){
            reservedSpans[i].classList.add(HTMLElement.VISIBLE_CLASS_NAME);
            reservedSpans[i].onmouseover = () => {
                alert('ddd');
            }
        }
    }
}

