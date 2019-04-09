var $text = null;
var $save = null;
var $poster = null;
var $themeButtons = null;
var $aspectRatioButtons = null;
var $quote = null;
var $fontSize = null;
var $show = null;
var $source = null;
var $quote = null;
var $logoWrapper = null;
var $highlightButtons = null;
var $resetHighlight = null;

var quotes = [
    {
        "quote": "I'd been drinking.",
        "source": "Dennis Rodman<br>Basketball guy"
    },
    {
        "quote": "I've made a huge mistake.",
        "source": "G.O.B.<br>Local Magician"
    },
    {
        "quote": "Yes, I have smoked crack cocaine",
        "source": "Rob Ford<br>Toronto Mayor",
        "size": 65
    },
    {
        "quote": "Annyong.",
        "source": "Annyong<br>Annyong",
        "size": 90
    },
    {
        "quote": "STEVE HOLT!",
        "source": "Steve Holt<br>High schooler",
        "size": 65
    },
    {
        "quote": "Whoa, whoa, whoa. There's still plenty of meat on that bone. Now you take this home, throw it in a pot, add some broth, a potato. Baby, you've got a stew going.",
        "source": "Carl Weathers<br>Acting Coach",
        "size": 40
    }
];


// Change straight quotes to curly and double hyphens to em-dashes.
function smarten(a) {
  a = a.replace(/(^|[-\u2014\s(\["])'/g, "$1\u2018");       // opening singles
  a = a.replace(/'/g, "\u2019");                            // closing singles & apostrophes
  a = a.replace(/(^|[-\u2014/\[(\u2018\s])"/g, "$1\u201c"); // opening doubles
  a = a.replace(/"/g, "\u201d");                            // closing doubles
  a = a.replace(/--/g, "\u2014");                           // em-dashes
  a = a.replace(/ \u2014 /g, "\u2009\u2014\u2009");         // full spaces wrapping em dash
  return a;
}

var aspectRatioOutputs = {
    square: [1080, 1080],
    'sixteen-by-nine': [1920, 1080],
    'two-by-one': [1024, 512],
    'facebook-ratio': [1200, 630],
    'eight-by-ten': [1080, 1350]
};
function getOutputDims() {
    return aspectRatioOutputs[
        $aspectRatioButtons.filter('.active').attr('id')
    ];
}

function convertToSlug(text) {
    return text
        .toLowerCase()
        .replace(/[^\w ]+/g,'')
        .replace(/ +/g,'-');
}

function processText() {
    $('.poster .blockquote p, .source').each(function() {
        var rawText = $(this).html();
        var processedText = smarten($.trim(rawText).replace('&nbsp;', ' '));
        if ( ! $(this).hasClass('source') )
            processedText = processedText.replace(/<br\s*\/?>/, '');
        if ( rawText !== processedText )
            $(this).html(processedText)
    });
}

function isTextTooLong() {
    return ($source.offset().top + $source.height()) > $logoWrapper.offset().top
}

function saveImage() {
    // first check if the quote actually fits
    if ( isTextTooLong() ) autoFontSize();

    // don't print placeholder text if source is empty
    if ($source.text() === '') {
        alert("A source is required.");
        return;
    }

    // make sure source begins with em dash
    // if (!$source.text().match(/^[\u2014]/g)) {
    //     $source.html('&mdash;&thinsp;' + $source.text());
    // }

    $('canvas').remove();
    processText();

    var dims = getOutputDims();
    var scale = dims[0] / $poster.outerWidth();

    html2canvas($poster[0], { scale: scale }).then(function(canvas) {
        document.body.appendChild(canvas);
        var canvases = document.getElementsByTagName("canvas");
        window.oCanvas = canvases[0];
        var strDataURI = window.oCanvas.toDataURL();

        var quote = $('.blockquote').text().split(' ', 5);
        var filename = convertToSlug(quote.join(' '));

        var a = $("<a>").attr("href", strDataURI).attr("download", "quote-" + filename + ".png").appendTo("body");

        a[0].click();

        a.remove();

        $('#download').attr('href', strDataURI).attr('target', '_blank');
        $('#download').trigger('click');
    });
}

function adjustFontSize(size) {
    var fontSize = size.toString() + '%';
    $('.poster .blockquote p').css('font-size', fontSize);
    processText();
    if ($fontSize.val() !== size) $fontSize.val(size);
}

function autoFontSize() {
    var max = Number($fontSize.attr('max'));
    var min = Number($fontSize.attr('min'));
    var cur = Number($fontSize.val());
    adjustFontSize(cur);
    if ( isTextTooLong() ) {
        while ( isTextTooLong() ) {
            var newSize = Number($fontSize.val()) - 1;
            if ( newSize < min ) break;
            adjustFontSize(newSize);
        }
    } else {
        while ( !isTextTooLong() ) {
            var newSize = Number($fontSize.val()) + 1;
            if ( newSize > max ) break;
            adjustFontSize(newSize);
        }
        if ( isTextTooLong() )
            adjustFontSize(Number($fontSize.val()) - 1);
    }
}

rangy.init();

var HighlighterButton = MediumEditor.extensions.button.extend({
  name: 'highlighter',

  tagNames: ['mark'], // nodeName which indicates the button should be 'active' when isAlreadyApplied() is called
  contentDefault: '<b>H</b>', // default innerHTML of the button
  contentFA: '<i class="fa fa-paint-brush"></i>', // innerHTML of button when 'fontawesome' is being used
  aria: 'Highlight', // used as both aria-label and title attributes
  action: 'highlight', // used as the data-action attribute of the button

  init: function () {
    MediumEditor.extensions.button.prototype.init.call(this);

    this.classApplier = rangy.createClassApplier('highlight', {
      elementTagName: 'mark',
      normalize: true
    });
  },

  handleClick: function (event) {
    this.classApplier.toggleSelection();
    this.base.checkContentChanged();
  }
});

$(function() {
    $text = $('.poster .blockquote p, .source');
    $save = $('#save');
    $poster = $('.poster');
    $themeButtons = $('#theme .btn');
    $aspectRatioButtons = $('#aspect-ratio .btn');
    $fontSize = $('#fontsize');
    $show = $('#show');
    $source = $('.source');
    $showCredit = $('.show-credit');
    $quote = $('#quote');
    $logoWrapper = $('.logo-wrapper');

    var quote = quotes[Math.floor(Math.random()*quotes.length)];
    $('.blockquote p').text(quote.quote);
    $source.html(quote.source);
    processText();
    autoFontSize();

    $save.on('click', saveImage);

    $themeButtons.on('click', function() {
        $themeButtons.removeClass().addClass('btn btn-primary');
        $(this).addClass('active');
        $poster
            .removeClass('poster-theme1 poster-theme2 poster-theme3 poster-theme4')
            .addClass('poster-' + $(this).attr('id'));
    });

    $aspectRatioButtons.on('click', function() {
        $aspectRatioButtons.removeClass().addClass('btn btn-primary');
        $(this).addClass('active');
        $poster
            .removeClass('square eight-by-ten sixteen-by-nine facebook-ratio two-by-one')
            .addClass($(this).attr('id'));
    });

    $quote.on('click', function() {
        $(this).find('button').toggleClass('active');
        $poster.toggleClass('quote');
    });

    $fontSize.on('input', function() {
        adjustFontSize($(this).val());
    });

    $show.on('keyup', function() {
        var inputText = $(this).val();
        $showCredit.text(inputText);
    });

    $('#auto-font').on('click', autoFontSize);

    var quoteEl = document.querySelectorAll('.poster .blockquote');
    var sourceEl = document.querySelectorAll('.source');

    var quoteEditor = new MediumEditor(quoteEl, {
        toolbar: {
            buttons: ['highlighter']
        },
        extensions: {
            'highlighter': new HighlighterButton()
        },
        buttonLabels: 'fontawesome',
        placeholder: 'Type your quote here',
        //disableExtraSpaces: true
    });

    var sourceEditor = new MediumEditor(sourceEl, {
        toolbar: false,
        placeholder: 'Type your quote source here',
        disableExtraSpaces: true
    });
});
