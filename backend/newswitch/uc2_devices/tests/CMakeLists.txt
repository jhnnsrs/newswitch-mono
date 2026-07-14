# Standalone CMake project for the ring buffer tests.
#
# The ring buffer is independent of the MVS camera SDK, so these tests build and
# run WITHOUT any vendor SDK installed:
#
#     cmake -S newswitch/uc2_devices/tests -B build-rbtests
#     cmake --build build-rbtests
#     ctest --test-dir build-rbtests --output-on-failure
#
cmake_minimum_required(VERSION 3.15)
project(uc2_ringbuffer_tests LANGUAGES CXX)

if(NOT CMAKE_CXX_STANDARD)
    set(CMAKE_CXX_STANDARD 14)
    set(CMAKE_CXX_STANDARD_REQUIRED ON)
endif()
if(NOT CMAKE_BUILD_TYPE AND NOT CMAKE_CONFIGURATION_TYPES)
    set(CMAKE_BUILD_TYPE Release CACHE STRING "Build type" FORCE)
endif()

find_package(Threads REQUIRED)

enable_testing()

add_executable(test_ringbuffer
    test_ringbuffer.cpp
    "${CMAKE_CURRENT_SOURCE_DIR}/../core/src/Ringbuffer.cpp")

target_include_directories(test_ringbuffer PRIVATE
    "${CMAKE_CURRENT_SOURCE_DIR}/../core/include")

target_link_libraries(test_ringbuffer PRIVATE Threads::Threads)

if(CMAKE_COMPILER_IS_GNUCXX OR CMAKE_CXX_COMPILER_ID MATCHES "Clang")
    target_compile_options(test_ringbuffer PRIVATE -Wall -Wextra)
endif()

add_test(NAME ringbuffer COMMAND test_ringbuffer)
