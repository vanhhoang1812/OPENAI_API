class ChatApp {
            constructor() {
                this.conversations = [];
                this.currentConversation = null;
                this.messageCount = 0;
                this.isOnline = navigator.onLine;
                
                this.initElements();
                this.bindEvents();
                this.loadConversations();
                this.initConnectionStatus();
            }

            initElements() {
                this.sidebar = document.getElementById('sidebar');
                this.menuToggle = document.getElementById('menuToggle');
                this.newChatBtn = document.getElementById('newChatBtn');
                this.chatHistory = document.getElementById('chatHistory');
                this.chatContainer = document.getElementById('chatContainer');
                this.welcomeScreen = document.getElementById('welcomeScreen');
                this.messageInput = document.getElementById('messageInput');
                this.sendBtn = document.getElementById('sendBtn');
                this.userAvatarBtn = document.getElementById('userAvatarBtn');
                this.userDropdown = document.getElementById('userDropdown');
                
                // Create connection status indicator
                this.connectionStatus = document.createElement('div');
                this.connectionStatus.className = 'connection-status hidden';
                document.body.appendChild(this.connectionStatus);
            }

            bindEvents() {
                this.menuToggle.addEventListener('click', () => this.toggleSidebar());
                this.newChatBtn.addEventListener('click', () => this.createNewChat());
                this.sendBtn.addEventListener('click', () => this.sendMessage());
                this.messageInput.addEventListener('input', () => this.handleInputChange());
                this.messageInput.addEventListener('keydown', (e) => this.handleKeyDown(e));
                this.userAvatarBtn.addEventListener('click', (e) => this.toggleUserDropdown(e));
                
                // Close dropdown when clicking outside
                document.addEventListener('click', (e) => {
                    if (!this.userAvatarBtn.contains(e.target) && !this.userDropdown.contains(e.target)) {
                        this.userDropdown.classList.remove('show');
                    }
                });
                
                // Auto-resize textarea
                this.messageInput.addEventListener('input', () => {
                    this.messageInput.style.height = 'auto';
                    this.messageInput.style.height = this.messageInput.scrollHeight + 'px';
                });
            }

            toggleSidebar() {
                this.sidebar.classList.toggle('collapsed');
            }

            toggleUserDropdown(e) {
                e.stopPropagation();
                this.userDropdown.classList.toggle('show');
            }

            createNewChat() {
                const conversation = {
                    id: Date.now(),
                    title: 'Cuộc trò chuyện mới',
                    messages: [],
                    createdAt: new Date()
                };
                
                this.conversations.unshift(conversation);
                this.setCurrentConversation(conversation);
                this.updateChatHistory();
                this.showWelcomeScreen();
                this.saveConversations();
            }

            setCurrentConversation(conversation) {
                this.currentConversation = conversation;
                this.updateChatHistory();
                this.renderMessages();
            }

            updateChatHistory() {
                this.chatHistory.innerHTML = '';
                
                this.conversations.forEach(conv => {
                    const item = document.createElement('div');
                    item.className = 'chat-item';
                    if (this.currentConversation && conv.id === this.currentConversation.id) {
                        item.classList.add('active');
                    }
                    item.textContent = conv.title;
                    item.addEventListener('click', () => this.setCurrentConversation(conv));
                    this.chatHistory.appendChild(item);
                });
            }

            showWelcomeScreen() {
                this.welcomeScreen.classList.remove('hidden');
                const messages = this.chatContainer.querySelectorAll('.message');
                messages.forEach(msg => msg.remove());
            }

            hideWelcomeScreen() {
                this.welcomeScreen.classList.add('hidden');
            }

            async sendMessage(text = null) {
                const message = text || this.messageInput.value.trim();
                if (!message) return;

                if (!this.currentConversation) {
                    this.createNewChat();
                }

                this.hideWelcomeScreen();
                
                // Add user message
                this.addMessage('user', message);
                this.messageInput.value = '';
                this.messageInput.style.height = 'auto';
                this.updateSendButton();

                // Show typing indicator
                this.showTypingIndicator();

                try {
                    // Prepare messages array for API
                    const messages = this.currentConversation.messages.map(msg => ({
                        role: msg.role,
                        content: msg.content
                    }));

                    // Call backend API
                    const response = await fetch('http://127.0.0.1:5000/chat', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            messages: messages
                        })
                    });

                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }

                    const data = await response.json();
                    
                    this.hideTypingIndicator();
                    
                    if (data.error) {
                        this.addMessage('assistant', 'Xin lỗi, đã có lỗi xảy ra: ' + data.error);
                    } else {
                        this.addMessage('assistant', data.response);
                    }
                    
                    this.updateConversationTitle(message);
                    
                } catch (error) {
                    console.error('Error calling chat API:', error);
                    this.hideTypingIndicator();
                    this.addMessage('assistant', 'Xin lỗi, không thể kết nối đến server. Vui lòng thử lại sau.');
                }
            }

            addMessage(role, content) {
                const messageDiv = document.createElement('div');
                messageDiv.className = `message ${role}`;
                
                if (role === 'user') {
                    messageDiv.innerHTML = `
                        <div class="user-message">${this.escapeHtml(content)}</div>
                    `;
                } else {
                    messageDiv.innerHTML = `
                        <div class="avatar">
                            <img class="img-ai" src="img/ai.png" alt="" />
                        </div>
                        <div class="message-content">${this.formatResponse(content)}</div>
                    `;
                }
                
                this.chatContainer.appendChild(messageDiv);
                this.chatContainer.scrollTop = this.chatContainer.scrollHeight;

                // Add to conversation
                if (this.currentConversation) {
                    this.currentConversation.messages.push({ role, content });
                    this.saveConversations();
                }
            }

            showTypingIndicator() {
                const typingDiv = document.createElement('div');
                typingDiv.className = 'message assistant typing-indicator';
                typingDiv.id = 'typingIndicator';
                typingDiv.innerHTML = `
                    <div class="avatar ">
                        <img class="img-ai" src="img/ai.png" alt="" />
                    </div>
                    <div class="message-content">
                    <div class="typing-dots">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    </div>
                </div>
                `;
                this.chatContainer.appendChild(typingDiv);
                this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
            }

            hideTypingIndicator() {
                const typingIndicator = document.getElementById('typingIndicator');
                if (typingIndicator) {
                    typingIndicator.remove();
                }
            }

            generateResponse(message) {
                // This method is now replaced by API call, keeping for fallback
                const responses = [
                    "Cảm ơn bạn đã hỏi! Đây là một câu hỏi thú vị. Tôi sẽ cố gắng trả lời một cách chi tiết và hữu ích nhất có thể.",
                    "Tôi hiểu câu hỏi của bạn. Dựa trên thông tin tôi có, tôi có thể chia sẻ những điều sau:",
                    "Đây là một chủ đề rất hay! Để trả lời câu hỏi này, tôi cần phân tích từ nhiều góc độ khác nhau.",
                    "Cảm ơn bạn đã tin tưởng hỏi tôi. Tôi sẽ cố gắng đưa ra câu trả lời phù hợp và chính xác nhất.",
                    "Tôi rất vui được giúp bạn! Dựa trên câu hỏi của bạn, tôi có thể đưa ra một số gợi ý và thông tin hữu ích."
                ];
                
                return responses[Math.floor(Math.random() * responses.length)] + 
                       "\n\nNếu bạn cần thêm thông tin chi tiết hoặc có câu hỏi khác, đừng ngại hỏi tôi nhé!";
            }

            // Add retry functionality for failed requests
            async retryLastMessage() {
                if (this.currentConversation && this.currentConversation.messages.length > 0) {
                    const lastUserMessage = [...this.currentConversation.messages]
                        .reverse()
                        .find(msg => msg.role === 'user');
                    
                    if (lastUserMessage) {
                        // Remove the last assistant message if it was an error
                        const lastMessage = this.currentConversation.messages[this.currentConversation.messages.length - 1];
                        if (lastMessage.role === 'assistant' && lastMessage.content.includes('Xin lỗi')) {
                            this.currentConversation.messages.pop();
                            const lastMessageElement = this.chatContainer.lastElementChild;
                            if (lastMessageElement && lastMessageElement.classList.contains('message')) {
                                lastMessageElement.remove();
                            }
                        }
                        
                        await this.sendMessage(lastUserMessage.content);
                    }
                }
            }

            updateConversationTitle(firstMessage) {
                if (this.currentConversation && this.currentConversation.messages.length <= 2) {
                    this.currentConversation.title = firstMessage.length > 30 ? 
                        firstMessage.substring(0, 30) + '...' : firstMessage;
                    this.updateChatHistory();
                    this.saveConversations();
                }
            }

            renderMessages() {
                // Clear current messages
                const messages = this.chatContainer.querySelectorAll('.message');
                messages.forEach(msg => msg.remove());

                if (!this.currentConversation || this.currentConversation.messages.length === 0) {
                    this.showWelcomeScreen();
                    return;
                }

                this.hideWelcomeScreen();
                
                this.currentConversation.messages.forEach(msg => {
                    this.addMessageToDOM(msg.role, msg.content);
                });
            }

            addMessageToDOM(role, content) {
                const messageDiv = document.createElement('div');
                messageDiv.className = `message ${role}`;
                
                if (role === 'user') {
                    messageDiv.innerHTML = `
                        <div class="user-message">${this.escapeHtml(content)}</div>
                    `;
                } else {
                    messageDiv.innerHTML = `
                        <div class="avatar">AI</div>
                        <div class="message-content">${this.formatResponse(content)}</div>
                    `;
                }
                
                this.chatContainer.appendChild(messageDiv);
            }

            formatResponse(text) {
                return marked.parse(text);
                // return this.escapeHtml(text).replace(/\n/g, '<br>');
            }

            escapeHtml(text) {
                const div = document.createElement('div');
                div.textContent = text;
                return div.innerHTML;
            }

            handleInputChange() {
                this.updateSendButton();
            }

            updateSendButton() {
                const hasText = this.messageInput.value.trim().length > 0;
                this.sendBtn.disabled = !hasText;
            }

            handleKeyDown(e) {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            }

            saveConversations() {
                // In a real app, this would save to a backend
                // For demo purposes, we'll just store in memory
            }

            loadConversations() {
                // In a real app, this would load from a backend
                // For demo purposes, we'll start with empty conversations
            }

            initConnectionStatus() {
                // Monitor connection status
                window.addEventListener('online', () => {
                    this.isOnline = true;
                    this.showConnectionStatus('online', 'Đã kết nối');
                });

                window.addEventListener('offline', () => {
                    this.isOnline = false;
                    this.showConnectionStatus('offline', 'Mất kết nối');
                });
            }

            showConnectionStatus(status, message) {
                this.connectionStatus.className = `connection-status ${status}`;
                this.connectionStatus.textContent = message;
                
                setTimeout(() => {
                    this.connectionStatus.classList.add('hidden');
                }, 3000);
            }
        }

        // Initialize the chat app
        const chatApp = new ChatApp();

        // Global function for suggestions
        function sendSuggestion(text) {
            chatApp.sendMessage(text);
        }

        // Global function for menu actions
        function handleMenuClick(action) {
            const dropdown = document.getElementById('userDropdown');
            dropdown.classList.remove('show');
            
            switch(action) {
                case 'upgrade':
                    alert('Tính năng nâng cấp gói sẽ được triển khai sớm!');
                    break;
                case 'personalize':
                    alert('Tính năng cá nhân hóa sẽ được triển khai sớm!');
                    break;
                case 'settings':
                    alert('Tính năng cài đặt sẽ được triển khai sớm!');
                    break;
                case 'help':
                    alert('Tính năng trợ giúp sẽ được triển khai sớm!');
                    break;
                case 'logout':
                    if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
                        alert('Đã đăng xuất thành công!');
                    }
                    break;
            }
        }