FROM maven:3.9.16-eclipse-temurin-25

WORKDIR /app

COPY . .

RUN mvn clean package -DskipTests

EXPOSE 8080

CMD ["java", "-jar", "target/smart-note-manager-1.0.0.jar"]