async function bootstrap() {
  setTimeout(() => console.log("1 sec"), 1000);
  setTimeout(() => console.log("2 sec"), 2000);

  console.log("0 sec");
}

bootstrap();


