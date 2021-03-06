create database if not exists `chatroom`;

use chatroom;

set foreign_key_checks = 0;
drop table if exists user;
drop table if exists message;

-- table for user
create table user(
    username varchar(20) not null,
    password varchar(20) not null,
    isOnline boolean default false,
    constraint username primary key (username)
)character set = utf8;

-- table for message
create table message(
    id int not null auto_increment, 
    content varchar(500) not null,
    fromUser varchar(20) not null, 
    sendTime varchar(50) not null,
    constraint id primary key (id)
)auto_increment = 1, character set = utf8;

insert into user (username, password) values ('aa', 'aa');
insert into user (username, password) values ('bb', 'bb');
