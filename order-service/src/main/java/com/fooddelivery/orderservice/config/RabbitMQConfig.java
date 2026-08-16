// package com.fooddelivery.orderservice.config;
// 
// import org.springframework.amqp.core.*;
// import org.springframework.amqp.rabbit.connection.ConnectionFactory;
// import org.springframework.amqp.rabbit.core.RabbitTemplate;
// import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
// import org.springframework.amqp.support.converter.MessageConverter;
// import org.springframework.context.annotation.Bean;
// import org.springframework.context.annotation.Configuration;
// 
// @Configuration
// public class RabbitMQConfig {
// 
//     public static final String ORDER_EXCHANGE = "order.exchange";
//     public static final String PAYMENT_EXCHANGE = "payment.exchange";
//     public static final String ORDER_QUEUE = "order.queue";
//     public static final String ROUTING_KEY_SUCCESS = "payment.completed";
// 
//     @Bean
//     public TopicExchange orderExchange() {
//         return new TopicExchange(ORDER_EXCHANGE);
//     }
// 
//     @Bean
//     public Queue orderQueue() {
//         return new Queue(ORDER_QUEUE);
//     }
// 
//     @Bean
//     public Binding bindingOrderQueue(Queue orderQueue, TopicExchange orderExchange) {
//         return BindingBuilder.bind(orderQueue).to(orderExchange).with(ROUTING_KEY_SUCCESS);
//     }
// 
//     @Bean
//     public MessageConverter converter() {
//         return new Jackson2JsonMessageConverter();
//     }
// 
//     @Bean
//     public AmqpTemplate amqpTemplate(ConnectionFactory connectionFactory) {
//         RabbitTemplate rabbitTemplate = new RabbitTemplate(connectionFactory);
//         rabbitTemplate.setMessageConverter(converter());
//         return rabbitTemplate;
//     }
// }
