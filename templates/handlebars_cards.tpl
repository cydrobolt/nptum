{{! Change delimeters to allow Handlebars braces to show. }}
{{=<% %>=}}

<script id="cards-template" type="text/x-handlebars-template">
    <div class="row">
        <div class="col s12 m6">
            <div class="card blue-grey darken-1">
                <div class="card-content white-text">
                    <span class="card-title">{{card_title}}</span>

                    <p>{{card_content}}</p>
                </div>
                {{#if card_actions}}
                <div class="card-action">
                    <!-- <a href="#">This is a link</a> -->
                    <!-- <a href="#">This is a link</a> -->
                    {{card_actions}}
                </div>
                {{/if}}
            </div>
        </div>
    </div>
</script>
